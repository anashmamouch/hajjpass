userpaApp.controller('providerListCtrl', ['$rootScope', 'providerDetailFactory', '$stateParams', '$timeout', 'gpsEnabled', '$interval', 'providerList', 'toolsFactory', '$ionicPopover', '$scope', '$filter', 'sqliteFactory', 'imagesFactory', 'localStorage', '$cordovaSocialSharing', '$ionicSideMenuDelegate', 'coordinatesFactory', 'snackbar', '$state', '$translate', '$ionicLoading', 'moment', '_', 'providerFactory', '$sce', function ($rootScope, providerDetailFactory, $stateParams, $timeout, gpsEnabled, $interval, providerList, toolsFactory, $ionicPopover, $scope, $filter, sqliteFactory, imagesFactory, localStorage, $cordovaSocialSharing, $ionicSideMenuDelegate, coordinatesFactory, snackbar, $state, $translate, $ionicLoading, moment, _, providerFactory, $sce) {
        $scope.filter = $stateParams.filter;
        $scope.orderBy = "name";
        $rootScope.$on('$ionicView.enter', function (event, viewData) {
            $rootScope.loaderValue = 100;
            loadProviders();
            $ionicSideMenuDelegate.canDragContent(true);
        });
        var loadProviders = function () {
            var order = localStorage.get("orderBy");
            $scope.providers = providerList;
            $scope.gpsEnabled = gpsEnabled;
            angular.forEach(providerList, function (provider, index) {
                if (provider.name.match(/(<([^>]+)>)/ig) !== null) {
                    provider.name = $sce.trustAsHtml(provider.name);
                }
                switch (appLanguage) {
                    case 'fr':
                        if (provider.description_fr !== null) {
                            if (provider.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = $sce.trustAsHtml(provider.description_fr);
                            } else {
                                provider.description = $sce.trustAsHtml(provider.description_fr.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                            }
                            provider.long_description = $sce.trustAsHtml(provider.long_description_fr);
                        }
                        break;
                    case 'en':
                        if (provider.description_en !== null && angular.isDefined(provider.description_en)) {
                            if (provider.description_en.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = $sce.trustAsHtml(provider.description_en);
                            } else {
                                provider.description = $sce.trustAsHtml(provider.description_en.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                            }
                            provider.long_description = $sce.trustAsHtml(provider.long_description_en);
                        }
                        else if (provider.description_fr !== null) {
                            if (provider.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = $sce.trustAsHtml(provider.description_fr);
                            } else {
                                provider.description = $sce.trustAsHtml(provider.description_fr.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                            }
                            provider.long_description = $sce.trustAsHtml(provider.long_description_fr);
                        }
                        break;
                    default:
                        if (provider.description_en !== null && angular.isDefined(provider.description_en)) {

                            if (provider.description_en.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = $sce.trustAsHtml(provider.description_en);
                            } else {
                                provider.description = $sce.trustAsHtml(provider.description_en.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                            }
                            provider.long_description = $sce.trustAsHtml(provider.long_description_en);
                        } else if (provider.description_fr !== null) {
                            if (provider.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description =$sce.trustAsHtml(provider.description_fr);
                            } else {
                                provider.description = $sce.trustAsHtml(provider.description_fr.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                            }
                            provider.long_description = $sce.trustAsHtml(provider.long_description_fr);
                        }
                        break;
                }
            })
            if (gpsEnabled && order == null) {
                $scope.orderBy = "name";
                localStorage.set("orderBy", "name");
            } else if (order === null) {
                $scope.orderBy = "name";
                localStorage.set("orderBy", "name");
            } else if (!gpsEnabled) {
                $scope.orderBy = 'name';
                localStorage.set('orderBy', 'name');
            } else {
                $scope.orderBy = order;
                localStorage.set("orderBy", order);
            }
            $timeout(function(){
                $ionicLoading.hide();
                $rootScope.isBar = false;

            }, 500);
        };
        if (ionic.Platform.isWebView()) {
            $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                $ionicLoading.hide();
                snackbar.createSnackbar($translate.instant("no_internet"));
            });
        } else {
            window.addEventListener('offline', function (e) {
                $ionicLoading.hide();
                snackbar.createSnackbar($translate.instant("no_internet"));
            }, false);
        }

        $scope.tidy = function (input) {
            var e = document.createElement('div');
            e.innerHTML = input;
            // handle case of empty input
            return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
        }
        $scope.share = function (provider) {
            $cordovaSocialSharing.share(null, provider.name, null, provider.website).then(function (result) { }, function (err) { });
        };

        $scope.view = function (provider) {
            providerDetailFactory.selectedProvider = provider;
            $ionicLoading.show({
                templateUrl: 'templates/loadingTemplate.html'
            });
            $state.go('app.partnerdetail', {'id': provider.idprovider});
        };
        $scope.goEvents = function (idprovider) {
            $state.go('app.partnerdetail', {'id': idprovider, 'anchor': '#events'});
        };

        var template = '<ion-popover-view><ion-header-bar><h1 class="title">{{"order_by" | translate}}</h1></ion-header-bar><ion-content><ul class="list"><li class="item" ng-click="orderProviders(1)"><i ng-show="orderBy == \'name\'" class="icon ion-android-checkbox-outline"></i><i ng-hide="orderBy == \'name\'" class="icon ion-android-checkbox-outline-blank"></i> {{"name" | translate}}</li><li class="item" ng-click="orderProviders(2)"><i ng-show="orderBy == \'value\'" class="icon ion-android-checkbox-outline"></i><i ng-hide="orderBy == \'value\'" class="icon ion-android-checkbox-outline-blank"></i> {{"distance" | translate}}</li></ul></ion-content></ion-popover-view>';

        $scope.popover = $ionicPopover.fromTemplate(template, {
            scope: $scope
        });
        $scope.popoverOpen = function ($event) {
            $scope.popover.show($event);
        };
        $scope.orderProviders = function (index) {
            switch (index) {
                case 1:
                    $rootScope.orderBy = "name";
                    localStorage.set("orderBy", "name");
                    $scope.orderBy = $rootScope.orderBy;
                    $scope.popover.hide();
                    break;
                case 2:
                    $rootScope.orderBy = "value";
                    localStorage.set("orderBy", "value");
                    $scope.orderBy = $rootScope.orderBy;
                    $scope.popover.hide();
                    break;
            }
        };
        $scope.showDiscounts = function (index) {
            if ($scope.activeProviderIndex === index) {
                $scope.activeProviderIndex = -1;
            } else {
                $scope.activeProviderIndex = index;
            }
        };

        $scope.isShowing = function (index) {
            return $scope.activeProviderIndex === index;
        };

    }]);
