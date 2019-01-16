userpaApp.factory("providerListCacheService", ['$q', 'providerFactory', function ($q, providerFactory) {

    var factory = {
        providerListCache : [],

        getList: function () {
            var deferred = $q.defer();

            if (factory.providerListCache.length === 0) {
                providerFactory.getProviders().then(function success(res) {
                    factory.providerListCache = res;
                    deferred.resolve(factory.providerListCache);
                }, function error(err) {
                    console.log(err);
                });
            } else {
                deferred.resolve(factory.providerListCache);
            }

            return deferred.promise;
        }
    };
    return factory
}]); 
