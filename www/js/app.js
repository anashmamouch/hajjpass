// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

var userpaApp = angular.module('starter', ['ionic', 'Tek.progressBar', 'nemLogging', 'ui-leaflet', 'pascalprecht.translate', 'ngCordova', 'ngSanitize', 'xml', 'angular-md5', 'ngOnload', 'angular-cache', 'ui.calendar', 'angularMoment', 'underscore', 'tmh.dynamicLocale', 'td.barcode']);

userpaApp.run(['$ionicPlatform', '$translate', '$cordovaSQLite', '$ionicHistory', 'loginFactory', 'sqliteFactory', 'initFactory', '$rootScope', '$state', '$ionicLoading', 'coordinatesFactory', 'localStorage', 'synchro', '$ionicViewSwitcher', 'snackbar', '$ionicPopup', 'providerFactory', 'tmhDynamicLocale', 'gpsFactory', 'migration', 'connectivityMonitor', 'toolsFactory',
    function ($ionicPlatform, $translate, $cordovaSQLite, $ionicHistory, loginFactory, sqliteFactory, initFactory, $rootScope, $state, $ionicLoading, coordinatesFactory, localStorage, synchro, $ionicViewSwitcher, snackbar, $ionicPopup, providerFactory, tmhDynamicLocale, gpsFactory, migration, connectivityMonitor, toolsFactory) {
        $ionicPlatform.ready(function () {
            try {
                $ionicLoading.show({
                    templateUrl: 'templates/loadingTemplate.html'
                });
                $rootScope.loaderMessage = false;
                $rootScope.checkState = function () {
                    $rootScope.numotipassNb = localStorage.get('numotipassNb');
                    $rootScope.state = '';
                    if (!$rootScope.numotipassNb) {
                        $rootScope.state = 'app.home.listpartners';
                    } else {
                        $rootScope.state = 'app.home.listpartners';

                    }
                }
                $rootScope.init = function () {
                    if (localStorage.get('serialType') === null || localStorage.get('serialType') === undefined) {
                        if (connectivityMonitor.isOnline()) {
                            $rootScope.isInit = true;
                            loginFactory.adminConnect().then(function success(res) {
                                sqliteFactory.checkHolder().then(function success(response) {
                                    if (response === true) {
                                        serialNumber = device.serial;
                                        localStorage.set('serialType', 'serial')
                                    } else {
                                        serialNumber = device.uuid;
                                        localStorage.set('serialType', 'uuid');
                                        localStorage.set('serial', device.uuid);
                                        sqliteFactory.clearTables();
                                    }
                                }).then(function success() {
                                    if (isReady === false || isReady === null) {
                                        $rootScope.loaderValueInit += 30;
                                        initFactory.initApp(null).then(function success(providerList) {
                                            $rootScope.loaderValueInit += 30;
                                            providerFactory.setProviders(providerList);
                                            initFactory.initDatabase().then(function success(response) {
                                                $rootScope.loaderMessage = true;
                                                providerFactory.getProvidersImgUrl(providerList).then(function () {
                                                    $rootScope.loaderMessage = false;
                                                    $rootScope.loaderValueInit += 30;
                                                    $rootScope.checkState();
                                                    localStorage.set('isReady', 'true');
                                                    $rootScope.isReady = true;
                                                    $rootScope.$broadcast('actualizeMenu');
                                                    gpsFactory.checkGPS().then(function success() {
                                                        $state.go($rootScope.state, {}, {});
                                                    }, function error(err) {
                                                        $state.go($rootScope.state, {}, {});
                                                    });
                                                    synchro.initSynchronization();
                                                })
                                            }, function error(response) {
                                                throw new Error("App.js - initDataBase: " + JSON.stringify(response));
                                            });
                                        }, function error() {
                                            throw new Error('App.js - initApp: ' + JSON.stringify(err));
                                        });
                                    } else {
                                        $rootScope.isReady = true;
                                        synchro.syncNow().then(function success() {
                                            synchro.initSynchronization();
                                            $rootScope.$broadcast('actualizeMenu');
                                            gpsFactory.checkGPS().then(function success() {
                                                $state.go($rootScope.state, {}, {});
                                            }, function error(err) {
                                                $state.go($rootScope.state, {}, {});
                                            });
                                        }, function error() {
                                            synchro.initSynchronization();
                                            $rootScope.$broadcast('actualizeMenu');
                                            gpsFactory.checkGPS().then(function success() {
                                                $state.go($rootScope.state, {}, {});
                                            }, function error(err) {
                                                $state.go($rootScope.state, {}, {});
                                            });
                                        });
                                    }
                                }), function error(err) {
                                    throw new Error('App.js - checkHolder: ' + JSON.stringify(err));
                                };
                            });
                        } else {
                            alert($translate.instant("need_init"));
                            if (devicePlatform == "android") {
                                navigator.app.exitApp();
                            }
                        }
                    } else {
                        $rootScope.$broadcast('actualizeMenu');
                        $rootScope.isInit = false;
                        $rootScope.isReady = true;
                        $rootScope.loaderValue += 30;
                        serialNumber = device.uuid;
                        migration.getCurrentVersion().then(function (isUpToDate) {
                            if (isUpToDate) {
                                localStorage.set('isReady', 'true');
                                $rootScope.isReady = true;
                                if (connectivityMonitor.isOnline()) {
                                    loginFactory.adminConnect().then(function () {
                                        initFactory.initProviderList().then(function (providerList) {
                                            providerFactory.setProviders(providerList);
                                            gpsFactory.checkGPS().then(function success() {
                                                $state.go($rootScope.state, {}, {});
                                            }, function error(err) {
                                                $state.go($rootScope.state, {}, {});
                                            });
                                            $rootScope.loaderValue += 30;

                                        }, function err(err) {
                                            gpsFactory.checkGPS().then(function success() {
                                                $state.go($rootScope.state, {}, {});
                                            }, function error(err) {
                                                $state.go($rootScope.state, {}, {});
                                            });
                                        })
                                    })
                                } else {
                                    $rootScope.loaderValue += 30;
                                    providerFactory.getProvidersFromFile();
                                    $state.go($rootScope.state, {}, {});
                                }
                            } else {
                                if (connectivityMonitor.isOnline()) {
                                    initFactory.initApp(null).then(function success(providerList) {
                                        providerFactory.setProviders(providerList);
                                        initFactory.initDatabase().then(function success(response) {
                                            localStorage.set('isReady', 'true');
                                            $rootScope.isReady = true;
                                            $state.go($rootScope.state, {}, {});
                                        }, function error(response) {
                                            throw new Error("App.js - initDataBase: " + JSON.stringify(response));
                                        });
                                    }, function error() {
                                        throw new Error('App.js - initApp: ' + JSON.stringify(err));
                                    });
                                } else {
                                    providerFactory.getProvidersFromFile();
                                    gpsFactory.checkGPS().then(function success() {
                                        $state.go($rootScope.state, {}, {});
                                    }, function error(err) {
                                        $state.go($rootScope.state, {}, {});
                                    });
                                }
                            }
                        });
                    }
                }
                // PROGRESSBAR VALUES
                $rootScope.isBar = true;
                $rootScope.loaderValue = 0;
                $rootScope.loaderValueInit = 0;
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }
                if (window.StatusBar) {
                    if (ionic.Platform.isAndroid()) {
                        StatusBar.backgroundColorByHexString('#540010');
                    } else {
                        StatusBar.styleLightContent();
                        StatusBar.overlaysWebView(true);
                    }
                }
                $rootScope.isOnline = true;
                $rootScope.isReady = false;
                isReady = localStorage.get('isReady');
                $rootScope.state = 'app.associatepass';
                $rootScope.checkState();
                // delete database if application is uninstall
                if ((isReady === false || isReady === null) && device.platform === 'Android') {
                    toolsFactory.clearDirectory();
                    window.sqlitePlugin.deleteDatabase({
                        name: 'pauser.db',
                        location: 'default'
                    });
                    console.log('Cleaned DB');
                }
                $rootScope.isLogged = localStorage.get('rememberMe') ? localStorage.get('rememberMe') : (localStorage.get('isLogged') ? localStorage.get('isLogged') : false);
                $rootScope.isRegister = localStorage.get('isRegister') ? localStorage.get('isRegister') : false;
                $rootScope.version = version;
                // detect which language is used from device and change the language of application
                if (typeof navigator.globalization !== "undefined") {
                    navigator.globalization.getPreferredLanguage(function (language) {
                        var lang = (language.value).split("-")[0];
                        if (supportedLanguages.indexOf(lang) == -1) {
                            lang = 'en';
                        }
                        appLanguage = lang;
                        tmhDynamicLocale.set(lang);
                        $translate.use(lang).then(function (data) {
                            console.log("SUCCESS -> " + data);
                        }, function (data) {
                            console.log("ERROR -> " + data);
                        });
                    }, null);
                }
                window.FirebasePlugin.subscribe(project + "prod" + "Advertisement");
                window.FirebasePlugin.subscribe(project + "prod" + "Notification");
                window.FirebasePlugin.getToken(function (token) {
                    console.log(token);
                });
                if (device.platform === 'Android') {
                    devicePlatform = 'android';
                    uuid = device.uuid;
                    storageDir = cordova.file.externalApplicationStorageDirectory;
                    // Database opening/creation
                    db = $cordovaSQLite.openDB({
                        name: "pauser.db",
                        location: 'default'
                    });
                    $rootScope.init();
                } else if (device.platform === 'iOS') {
                    db = $cordovaSQLite.openDB({
                        name: "pauser.db",
                        iosDatabaseLocation: 'default'
                    });
                    devicePlatform = 'ios';
                    window.plugins.uniqueDeviceID.get(function success(uuid) {
                        serialNumber = uuid;
                        localStorage.set('serial', uuid);
                        storageDir = cordova.file.dataDirectory;
                        console.log(uuid);
                        $rootScope.init();
                    }, function err(err) {
                        console.log('err : ' + serialNumber);
                    });
                }


                if (device.platform == "iOS") {
                    window.FirebasePlugin.hasPermission(function (data) {
                        if (!data.isEnabled) {
                            window.FirebasePlugin.grantPermission();
                        }
                    });
                }
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                window.FirebasePlugin.onNotificationOpen(
                    function (notification) {
                        if (notification.tap) {
                            if (notification.advertisement) {
                                synchro.syncNow().then(function success() {
                                    $state.go($rootScope.state, {
                                        'filter': ""
                                    });
                                })
                            }
                            else {
                                $ionicLoading.show({
                                    templateUrl: 'templates/loadingTemplate.html'
                                });
                                synchro.syncNow().then(function success(res) {
                                    $state.go('app.partnerdetail', {
                                        'id': notification.provider_id
                                    });
                                }, function error() {
                                    $ionicLoading.hide();
                                });
                            }
                        } else {
                            if (!notification.advertisement) {
                                synchro.syncNow();
                                snackbar.createSnackbar($translate.instant('events_tocome') + ' : ' + notification.providername);
                            }
                        }
                    },
                    function (error) {
                        console.log('Error registring onNotification callback: ' + JSON.stringify(error));
                    }
                );



                $rootScope.$on('showLoader', function () {
                    $ionicLoading.show({
                        templateUrl: 'templates/loadingTemplate.html'
                    });
                });

                $rootScope.$on('numotipass:change', function (event, data) {
                    localStorage.set('numotipassNb', data);
                    $rootScope.numotipassNb = data;
                });
                document.addEventListener('online', function () {
                    isOnline = true;
                    $rootScope.isOnline = true;
                    synchro.initSynchronization();
                }, false);

                document.addEventListener('offline', function () {
                    isOnline = false;
                    $rootScope.isOnline = false;
                    $rootScope.$on('$ionicView.beforeEnter', function (event, viewData) {
                        if (!isOnline && viewData.stateName != 'app.passdetails') {
                            snackbar.createSnackbar($translate.instant("no_internet"));
                        } else if (!isOnline) {
                            snackbar.createSnackbar($translate.instant("coupons_internet"));
                        }
                    });
                    synchro.destroySync();
                }, false);

                document.addEventListener('resume', function () {
                    synchro.initSynchronization();
                    if (device.platform === "iOS") {
                        gpsFactory.checkGPS();
                    }
                });

                $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
                    var direction = null;
                    if (fromState.stateUpward === toState.name)
                        direction = 'back';
                    if (toState.stateUpward === fromState.name)
                        direction = 'forward';
                    if (direction)
                        $ionicViewSwitcher.nextDirection(direction);
                });

                $ionicPlatform.onHardwareBackButton(function () {
                    if (($state.$current.url.prefix) === ("/app/home/listpartners/")) {
                        navigator.app.exitApp();
                    }
                });
            } catch (e) {
                console.log(e);
                throw new Error("App.js - onDeviceready - error: " + JSON.stringify(e));
            }
        });
    }
]);
userpaApp.factory('$exceptionHandler', [function () {
    return function (exception, cause) {
        console.log(exception);
        alert("An error occurs");
        if (devicePlatform == "android") {
            window.FirebasePlugin.logError(project + " : " + exception, function success() {

            }, function error() {

            })
        } else {
            window.fabric.Crashlytics.addLog(exception.stack);
            window.fabric.Crashlytics.recordError(exception, -1);
        }
        window.fabric.Crashlytics.addLog(JSON.stringify(exception.stack));
        window.fabric.Crashlytics.sendCrash();
        if (devicePlatform == "android") {
            navigator.app.exitApp();
        }
    }
}]);
userpaApp.config(['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('lib/angular-i18n/angular-locale_{{locale}}.js');
}]);

userpaApp.config(['$sceProvider', function($sceProvider){
    $sceProvider.enabled(false);
}]);
userpaApp.config(['$httpProvider', '$httpParamSerializerJQLikeProvider', function ($httpProvider, $httpParamSerializerJQLikeProvider) {
    $httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = true;
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push('xmlHttpInterceptor');
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
    var param = function (obj) {
        if (!angular.isString(obj)) {
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        }
    }


    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function (data) {
        if (!angular.isString(data)) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        } else {
            return data;
        }
    }];
    var interceptor = [function () {
        return {
            'requestError': function (rejection) {
                console.log(JSON.stringify(rejection));
            },
            'responseError': function (rejection) {
                console.log(JSON.stringify(rejection));
            }
        }
    }];
    $httpProvider.interceptors.push(interceptor);
}]);

userpaApp.config(['$ionicConfigProvider', function ($ionicConfigProvider) {
    $ionicConfigProvider.views.transition('none');
    $ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.views.swipeBackEnabled(false);
}]);
userpaApp.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|img-src|content|file|assets-library):|data:image\//);
}])

userpaApp.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        WEBSHOP_URL + '**',
    ]);
}]);


userpaApp.filter('startFrom', function () {
    return function (input, start) {
        if (angular.isDefined(input)) {
            start = parseInt(start, 10);
            return input.slice(start);
        }
    }
});
