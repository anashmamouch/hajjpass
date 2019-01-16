userpaApp.factory('markers', ['sqliteFactory', 'providerFactory', 'coordinatesFactory', 'imagesFactory', '$q', function (sqliteFactory, providerFactory, coordinatesFactory, imagesFactory, $q) {

    var factory = {
        providers: [],
        getMarkers: function (filter) {
            var deferred = $q.defer();
            factory.providers = [];
            providerFactory.getProviders().then(function (providersTmp) {
                var providersTmp2 = [];
                angular.forEach(providersTmp, function (provider) {
                    if (angular.isDefined(provider.latitude) && angular.isDefined(provider.longitude) && provider.longitude !== null && provider.latitude !== null) {
                        var address = provider.address + '+' + provider.postalcode + '+' + provider.city + '+' + provider.country_code_id;
                        coordinatesFactory.getCoordinatesWithAddress(provider.id, address).then(function success(location) {
                            provider.latitude = location.lat;
                            provider.longitude = location.lng;
                        }, function error(error) {
                            console.log('getCoordinates - error: ' + error.status + ' - ' + error.message);
                        });
                    }
                    if (provider.address.length > 0) {
                        providersTmp2.push(provider);
                    }
                });
                deferred.resolve(factory.providers);
            });
            return deferred.promise;
        }
    };
    return factory;

}]);
