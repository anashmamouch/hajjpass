userpaApp.factory('initFactory', ['$http', '$q', 'xml2jsonFactory', 'sqliteFactory', 'migration', 'loginFactory', '$state', '$rootScope',
    function ($http, $q, xml2jsonFactory, sqliteFactory, migration, loginFactory, $state, $rootScope) {
        var factory = {
            initProviderList: function () {
                var deferred = $q.defer();
                $http.post(prod.serverUrl + prod.providerListUrl, {}).then(function (providerList) {
                    deferred.resolve(providerList.data);
                }, function err(err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            initApp: function (numotipass) {
                var data = {
                    serial: serialNumber,
                    imei: imeiNumber,
                    numotipass: numotipass
                };
                var deferred = $q.defer();
                // login with admin user	
                loginFactory.adminConnect().then(function success(response) {
                    $http.post(prod.serverUrl + prod.urlInit, data, {params: data}).then(function successCallback(response) {
                        var status = xml2jsonFactory.convertData(response.data);
                        if (status.response.st === '412') {
                            deferred.resolve(false);
                        } else {
                            if (status.response.st == '406') {
                                serialNumber = uuid;
                                data.serial = uuid;
                                $http.post(prod.serverUrl + prod.urlInit, data, {params: data}).then(function successCallback(response2) {
                                    var status2 = xml2jsonFactory.convertData(response2.data);
                                    if (status2.response.st == '406') {
                                        deferred.reject(status2.response.st);
                                        alert("Cet appareil est déjà enregistré comme un terminal Colmar City Pass");
                                        navigator.app.exitApp();
                                    } else if (status2.response.st == '200') {
                                        migration.migrate().then(function success(response) {
                                            sqliteFactory.insertUsers(numotipass).then(function success(response) {
                                                if (!numotipass) {
                                                    factory.initProviderList().then(function success(providerList) {
                                                        loginFactory.disconnect().then(function success(response) {
                                                            deferred.resolve(providerList);
                                                        }, function err(err) {
                                                            deferred.reject(err);
                                                        })
                                                    }, function (err) {
                                                        deferred.reject(err);
                                                    })
                                                } else {
                                                    loginFactory.disconnect().then(function success(response) {
                                                        $rootScope.numotipassNb = numotipass;
                                                        deferred.resolve(cOK);
                                                    }, function err(err) {
                                                        deferred.reject(err);
                                                    })
                                                }
                                            });
                                        }, function error(error) {
                                            deferred.reject(error.message);
                                            alert('An error occurs');
                                            navigator.app.exitApp();
                                            console.log('CreateDatabasesOnInit() error: ' + JSON.stringify(error));
                                        });
                                    }
                                }, function errorCallback(response) {
                                    deferred.reject(response.status);
                                    console.log('initFactory::initApp() error: ' + JSON.stringify(response));
                                });
                            } else if (status.response.st == '200') {
                                migration.migrate().then(function success(response) {
                                    sqliteFactory.insertUsers(numotipass).then(function success(response) {
                                        if (!numotipass) {
                                            factory.initProviderList().then(function success(providerList) {
                                                loginFactory.disconnect().then(function success(response) {
                                                    console.log(response);
                                                    deferred.resolve(providerList);
                                                }, function err(err) {
                                                    deferred.reject(err);
                                                })
                                            }, function (err) {
                                                deferred.reject(err);
                                            })
                                        } else {
                                            sqliteFactory.insertOrderPos(numotipass).then(function () {
                                                loginFactory.disconnect().then(function success(response) {
                                                    $rootScope.numotipassNb = numotipass;
                                                    deferred.resolve(cOK);
                                                }, function err(err) {
                                                    deferred.reject(err);
                                                })
                                            }, function err(err) {
                                                deferred.reject(err);
                                            })
                                        }
                                    });
                                }, function error(error) {
                                    deferred.reject(error.message);
                                    alert('An error occurs');
                                    navigator.app.exitApp();
                                    console.log('CreateDatabasesOnInit() error: ' + JSON.stringify(error));
                                });
                            }
                        }
                        console.log('InitFactory::initApp() status: ' + status.response.st);
                    }, function errorCallback(response) {
                        deferred.reject(response.status);
                        console.log('initFactory::initApp() error: ' + JSON.stringify(response));
                    });
                }, function error(msg) {
                    deferred.reject(msg);
                    console.log('initApp::LoginAdmin error: ' + msg);
                });
                return deferred.promise;
            },
            initDatabase: function () {
                var deferred = $q.defer();
                loginFactory.connect().then(function success(response) {
                    sqliteFactory.populateDatabaseOnInitUser().then(function success(response) {
                        loginFactory.disconnect().then(function success(response) {
                            deferred.resolve(response);
                        }, function error(response) {
                            console.log('initDatabase - disconnect error: ' + JSON.stringify(response));
                            deferred.reject(JSON.stringify(response));
                        });
                    }, function error(response) {
                        deferred.reject(JSON.stringify(response));
                        console.log('initDatabase - populateDatabase error: ' + JSON.stringify(response));
                    });
                }, function error(response) {
                    deferred.reject(JSON.stringify(response));
                    console.log('initDatabase - connectUser error: ' + JSON.stringify(response));
                });
                return deferred.promise;
            },
            initAccount: function (numotipass) {
                var deferred = $q.defer();
                loginFactory.connect().then(function success(response) {
                    sqliteFactory.populateDatabaseOnCreateAccount(numotipass).then(function success(response) {
                        loginFactory.disconnect().then(function success(response) {
                            deferred.resolve(response);
                        });
                    }, function error(response) {
                        deferred.reject(JSON.stringify(response));
                        console.log('initAccount - populateDatabaseOnCreateAccount error: ' + JSON.stringify(response));
                    });
                }, function error(response) {
                    deferred.reject(JSON.stringify(response));
                    console.log('initAccount - connectUser error: ' + JSON.stringify(response));
                });
                return deferred.promise;
            }
        };
        return factory;
    }]);