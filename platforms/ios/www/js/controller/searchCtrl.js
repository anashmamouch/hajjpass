userpaApp.controller('searchCtrl', ['$scope', 'sqliteFactory', 'imagesFactory', '$rootScope', '$ionicLoading', 'providerFactory', function ($scope, sqliteFactory, imagesFactory, $rootScope, $ionicLoading, providerFactory) {

    $scope.providers = [];
    $scope.listVisible = false;
    $scope.query = {};
    $scope.query.text = "";

    if (ionic.Platform.isWebView()) {
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            $ionicLoading.hide();
        });
    } else {
        window.addEventListener('offline', function (e) {
            $ionicLoading.hide();
        }, false);
    }
    $scope.$on('providerlistLoaded', function(){
        providerFactory.getProviders().then(function success(res) {
            var providersTmp = res;
            var providers = [];
            angular.forEach(providersTmp, function (provider) {
                providers.push(provider);
            });
            $scope.providers = providers;
        }, function error(err) {
            console.log('searchCtrl - getProviderList: ' + err.message);
        });
    })


    $scope.searchFn = function (actual, expected) {
        if (angular.isObject(actual))
            return false;

        function removeAccents(value) {
            return value.toString()
                .replace(/à/g, 'a').replace(/â/g, 'a').replace(/á/g, 'a')
                .replace(/é/g, 'e').replace(/è/g, 'e')
                .replace(/í/g, 'i')
                .replace(/ó/g, 'o')
                .replace(/ù/g, 'u')
                .replace(/ñ/g, 'n');
        }

        actual = removeAccents(angular.lowercase('' + actual));
        expected = removeAccents(angular.lowercase('' + expected));
        return actual.indexOf(expected) !== -1;
    }

    $scope.resetQuery = function () {
        $scope.query.text = "";
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }


}]);

