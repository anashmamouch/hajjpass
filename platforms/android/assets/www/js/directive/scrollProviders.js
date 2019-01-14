userpaApp.directive('scrollprovider', ['$rootScope', 'CacheFactory', '$timeout', function($rootScope, CacheFactory, $timeout) {

    return function (scope, elem, attr) {
        var lastScrollY = 0,
            ticking = false,
            scrollCache;

        $rootScope.$on('$ionicView.enter', function (event, viewData) {
            if (angular.isDefined(viewData.stateParams)) {
                if (!CacheFactory.get('scrollCache_' + viewData.stateParams.filter)) {
                    CacheFactory.createCache('scrollCache_' + viewData.stateParams.filter, {
                        deleteOnExpire: 'aggressive',
                        recycleFreq: 60000
                    });
                    scrollCache = CacheFactory.get('scrollCache_' + viewData.stateParams.filter);
                } else {
                    scrollCache = CacheFactory.get('scrollCache_' + viewData.stateParams.filter);
                    if (angular.isDefined(scrollCache.get('lastScrollY'))) {
                        scrollTo(scrollCache.get('lastScrollY'));
                    }
                }
            }
        });

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toParams) {
                scrollCache = CacheFactory.get('scrollCache_' + toParams.filter);
            }
            switch (fromState.name) {
                case 'app.home.listpartners':
                case 'app.home.mappartners':
                case 'app.partnerdetail':
                    break;
                default:
                    if (angular.isDefined(scrollCache)) {
                        scrollCache.destroy();
                    }
                    break;
            }
        });

        function onScroll(event) {
            lastScrollY = event.target.scrollTop;
            requestTick();
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }

        function update() {
            if (angular.isDefined(scrollCache)) {
                scrollCache.put('lastScrollY', lastScrollY);
            }
            ticking = false;
        }

        function scrollTo(scrollY) {
            $timeout(function() {
                var container = angular.element(elem);
                container[0].scrollTop = scrollY;
            }, 1);
        }

        elem.bind('scroll', function(e) {
            onScroll(e);
        });

    }

}]);
