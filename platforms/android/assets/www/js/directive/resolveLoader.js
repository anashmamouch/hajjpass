userpaApp.directive('resolveLoader', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

        return {
            restrict: 'E',
            replace: true,
            template: '<ion-view cache-view="false"><ion-content><div class="content loading-box"><div class="container"><img class="logo" src="img/logo-colmar.png"><p><ion-spinner icon="dots"></ion-spinner> </p><p>{{"loading" | translate}}</p></div></div></ion-content></ion-view>',
            link: function (scope, element) {
                $rootScope.$on('$stateChangeStart', function (event, currentRoute, previousRoute) {
                    if (previousRoute)
                        return;
                    $timeout(function () {
                        element.removeClass('ng-hide');
                    });
                });
                $rootScope.$on('$stateChangeSuccess', function () {
                    element.addClass('ng-hide');
                });
            }
        };

    }]);