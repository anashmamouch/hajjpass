userpaApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'appCtrl'
        })
        .state('app.reduc', {
            url: '/reduc',
            views: {
                'menuContent': {
                    templateUrl: 'templates/reduc.html'
                }
            }
        })
        .state('app.home', {
            url: '/home',
            views: {
                'menuContent': {
                    templateUrl: 'templates/home.html'
                }
            }
        })
        .state('app.home.listpartners', {
            url: '/listpartners/:filter',
            views: {
                'listPartners': {
                    templateUrl: 'templates/listpartners.html',
                    controller: 'providerListCtrl',
                    resolve: {
                        'providerList': ['providerFactory', '$stateParams', function (providerFactory, $stateParams) {
                            return providerFactory.getProviders($stateParams.filter);
                        }],
                        'gpsEnabled': ['coordinatesFactory', function (coordinatesFactory) {
                            return coordinatesFactory.isGPSEnabled();
                        }],
                    }
                }
            }
        })

        .state('app.home.mappartners', {
            url: '/mappartners/:filter',
            views: {
                'mapPartners': {
                    templateUrl: 'templates/mappartners.html'
                }
            }
        })

        .state('app.reduc.listpartnersreduc', {
            url: '/listpartnersreduc/:filter',
            views: {
                'listPartnersReduc': {
                    templateUrl: 'templates/listpartners.html',
                    controller: 'providerListCtrl',
                    resolve: {
                        'providerList': ['providerFactory', '$stateParams', function (providerFactory, $stateParams) {
                            return providerFactory.getProviders($stateParams.filter);
                        }],
                        'gpsEnabled': ['coordinatesFactory', function (coordinatesFactory) {
                            return coordinatesFactory.isGPSEnabled();
                        }],
                        'hasAdvertisements' : ['banniereFactory', function (banniereFactory) {
                            return banniereFactory.getCurrentAdvertisement();
                        }]
                    }
                }
            }
        })
        .state('app.reduc.mappartnersreduc', {
            url: '/mappartnersreduc/:filter',
            views: {
                'mapPartnersReduc': {
                    templateUrl: 'templates/mappartners.html'
                }
            }
        })
        .state('app.partnerdetail', {
            url: '/partnerdetail/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/partnerdetail.html',
                    controller: 'providerDetailCtrl',
                    resolve: {
                        providerDetail : ['providerDetailFactory', function(providerDetailFactory){
                            return providerDetailFactory.getSelectedProvider();
                        }],
                        /*'providerHasOpening': ['sqliteFactory', '$stateParams', function (sqliteFactory, $stateParams) {
                            return sqliteFactory.checkOpenings($stateParams.id);
                        }],
                        'providerDetail': ['providerDetailFactory', '$stateParams', function (providerDetailFactory, $stateParams) {
                            return providerDetailFactory.getProviderDetail($stateParams.id);
                        }],*/
                        'gpsEnabled': ['coordinatesFactory', function (coordinatesFactory) {
                            return coordinatesFactory.isGPSEnabled();
                        }]
                    }
                }
            }
        })
        .state('app.eventsdetail', {
            url: '/eventsdetail/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/eventsDetail.html',
                    controller: 'eventCtrl'
                }
            }
        })
        .state('app.passdetails', {
            url: '/passdetails',
            views: {
                'menuContent': {
                    templateUrl: 'templates/passdetails.html',
                    controller: 'otipassCtrl',
                    resolve : {
                        'mypass' : ['otipass', function (otipass) {
                            return otipass.getOtipassList();
                        }]
                    }
                }
            }

        })
        .state('app.associatepass', {
            url: '/associatepass',

            views: {
                'menuContent': {
                    templateUrl: 'templates/associatepass.html'
                }
            }
        })
        .state('app.purchase', {
            url: '/purchase',
            views: {
                'menuContent': {
                    templateUrl: 'templates/purchase.html'
                }
            }
        })
        .state('app.accountedit', {
            url: '/accountedit',
            views: {
                'menuContent': {
                    templateUrl: 'templates/accountedit.html'
                }
            }
        })
        .state('app.accountedit.personalinfos', {
            url: '/personalinfos',
            views: {
                'personalInfos': {
                    templateUrl: 'templates/personalinfo.html'
                }
            }
        })
        .state('app.accountedit.identifiers', {
            url: '/identifiers',
            views: {
                'identifiers': {
                    templateUrl: 'templates/loginedit.html'
                }
            }
        })
        .state('app.logout', {
            url: '/logout'
        })
        .state('app.createaccount', {
            url: '/createaccount',
            views: {
                'menuContent': {
                    templateUrl: 'templates/createaccount.html'
                }
            },
            dragContent: true
        })
        .state('app.login', {
            url: '/login',
            views: {
                'menuContent': {
                    templateUrl: 'templates/login.html'
                }
            }
        })
        .state('app.search', {
            url: '/search',
            views: {
                'menuContent': {
                    templateUrl: 'templates/search.html',
                    controller: 'searchCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
}]);
