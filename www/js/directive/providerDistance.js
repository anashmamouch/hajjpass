userpaApp.directive('distance', ['$rootScope', '$compile', function($rootScope, $compile) {

    return {
        restrict: 'E',
        scope: {
            id: '=id',
            distance: '=distance',
            gpsEnabled: '=gpsEnabled'
        },
        template: '<span class="provider-distance" ng-if="distance && distance != \'NaN m\'"><i class="icon ion-location"></i>{{distance}}</span>',
        link: function(scope, elem, attrs) {
            $rootScope.$on('provider:distance', function(event, data) {
                if (angular.isObject(data)) {
                    angular.forEach(data, function(value, key) {
                        if (value.idprovider == scope.id && isNaN(value.value) == false){
                            scope.distance = value.distance;
                        }
                        else{
                            delete scope.distance;
                        }
                    })
                }
                else
                {
                    delete scope.distance;
                }
            });
        }
    }

}]);
