userpaApp.factory('otipass', ['loginFactory', 'sqliteFactory', 'localStorage', '$q', '$ionicLoading', '$http', 'xml2jsonFactory', '$translate', function (loginFactory, sqliteFactory, localStorage, $q, $ionicLoading, $http, xml2jsonFactory, $translate) {

    var factory = {
        getOtipass: function () {
            $ionicLoading.show({
                templateUrl: 'templates/loadingTemplate.html'
            });
            var deferred = $q.defer();
            var numotipass = localStorage.get('numotipassNb');
            if (isOnline) {
                loginFactory.connect().then(function success(response) {
                    sqliteFactory.insertOtipass(numotipass).then(function success(response) {
                        factory.getDatabaseOtipass().then(function success(response) {
                            deferred.resolve(response);
                        });
                    }, function error(response) {
                        deferred.resolve(factory.getDatabaseOtipass());
                    });
                }, function error(response) {
                    deferred.resolve(factory.getDatabaseOtipass());
                });
            } else {
                deferred.resolve(factory.getDatabaseOtipass());
            }
            return deferred.promise;
        },
        getDatabaseOtipass: function () {
            return sqliteFactory.getOtipass();
        },
        hasOtipass: function () {
            var deferred = $q.defer();
            sqliteFactory.getOtipass().then(function (res) {
                deferred.resolve(true);
            }, function (err) {
                deferred.resolve(false);
            });
            return deferred.promise;
        },
        associatePass: function (numotipass) {
            var deferred = $q.defer();
            var data = {
                serial: serialNumber,
                numotipass: numotipass
            };
            if (isOnline) {
                loginFactory.connect().then(function success(response) {
                    $http.post(prod.serverUrl + project + prod.urlAssociatePass, data, {params: data}).then(function success(res) {
                        var responseAPI = xml2jsonFactory.convertData(res.data);
                        if (responseAPI.response.st == 200) {
                            sqliteFactory.insertOtipass(numotipass).then(function () {
                                loginFactory.disconnect().then(function () {
                                    deferred.resolve(cOK);
                                });
                            }, function (err) {
                                loginFactory.disconnect();
                                deferred.reject(err);
                            })
                        } else {
                            loginFactory.disconnect();
                            deferred.reject(responseAPI.response.st);
                        }
                    }, function (err) {
                        loginFactory.disconnect();
                        deferred.reject(err);
                    })
                }, function (err) {
                    loginFactory.disconnect();
                    deferred.reject(err);
                });

            } else {
                deferred.resolve(false);
            }
            return deferred.promise;
        },
        getNumOtipassFromSerial: function (numotipass, nfcScanned) {
            var deferred = $q.defer();
            var pass = numotipass;
            if (nfcScanned) {
                pass = parseInt(numotipass, 16);
            }
            var data = {
                cryptedPass: pass
            };
            if (connectivityMonitor.isOnline()) {
                loginFactory.adminConnect().then(function (status) {
                    if (status == "200") {
                        $http.post(prod.serverUrl + prod.urlGetOtipass, data).then(function successCallback(response) {
                            var responseAPI = xml2jsonFactory.convertData(response.data);
                            if (responseAPI.response.st == "200") {
                                deferred.resolve(responseAPI.response.epass.pass.ot);
                            } else {
                                deferred.reject('Error pass inexistant');
                            }
                        }, function errorCallback(response) {
                            console.log(response.status);
                            deferred.reject('Error getOtipass');
                        })
                    } else {
                        deferred.reject('Error admin login');
                    }
                })

            } else {
                deferred.reject('no_internet');
            }
            return deferred.promise;
        },
        getOtipassList: function () {
            var deferred = $q.defer();
            var otipassList = [];
            factory.getOtipass().then(function (result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var pass = result.rows.item(i);
                    if (pass.expiry != null) {
                        if (devicePlatform == 'ios') {
                            pass.expiry = pass.expiry.replace(/-/g, '/');
                        }
                        var expiry_date = new Date(pass.expiry);
                        navigator.globalization.dateToString(expiry_date, function (date) {
                            pass.validity = date;
                        }, function (error) {
                            var expiry_date = pass.expiry.split(' ');
                            if (expiry_date.length > 0) {
                                var validity_date = expiry_date[0].split('-');
                                if (validity_date.length > 1) {
                                    pass.validity = validity_date[2] + '/' + validity_date[1] + '/' + validity_date[0];
                                }
                            }
                        }, {formatLength: 'short', selector: 'date and time'})
                    }
                    // pass status
                    if (pass.status > 0) {
                        if (pass.status == PASS_INACTIVE) {
                            pass.status_txt = $translate.instant("pass_inactive");
                        } else if (pass.status == PASS_ACTIVE) {
                            pass.status_txt = $translate.instant("pass_active");
                        } else if (pass.status == PASS_INVALID) {
                            pass.status_txt = $translate.instant("pass_invalid");
                        } else if (pass.status == PASS_EXPIRED) {
                            pass.status_txt = $translate.instant("pass_expired")
                        } else if (pass.status == PASS_CREATED) {
                            pass.status_txt = $translate.instant("pass_created");
                        }
                    }
                    // order_pos
                    var order_pos = null;
                    sqliteFactory.getOrderPosByOtipassId(pass.idotipass).then(function success(order_pos) {
                        if (order_pos != null) {
                            pass.tariff = order_pos.price;
                            if (devicePlatform == 'ios') {
                                order_pos.date = order_pos.date.replace(/-/g, '/');
                            }
                            var order_date = new Date(order_pos.date);
                            navigator.globalization.dateToString(order_date, function (date) {
                                pass.order_date = date;
                            }, function (error) {
                                order_date = order_pos.date.split(' ');
                                if (order_date.lenght > 0) {
                                    var date_order = order_date[0].split('-');
                                    if (date_order.length > 1) {
                                        pass.order_date = date_order[2] + '/' + date_order[1] + '/' + date_order[0];
                                    }
                                }
                            }, {formatLength: 'short', selector: 'date and time'});
                        }
                    });
                    // pass pid
                    pass.type_txt = pass.name;

                    // services
                    if (pass.service != null) {
                        var servicesTmp = factory.escapeHtml(pass.service);
                        servicesTmp = servicesTmp.split(';');
                        var services = [];
                        angular.forEach(servicesTmp, function (value, key) {
                            var tmpValue = value.split(':');
                            if (tmpValue[0].length > 0 && tmpValue[1].length > 0) {
                                services.push({
                                    name: tmpValue[0],
                                    nb: tmpValue[1]
                                });
                            }
                        });
                        pass.services = services;
                    }

                    otipassList.push(pass);
                }
                deferred.resolve(otipassList);
            })
            return deferred.promise;
        },
        escapeHtml: function (text) {
            return text
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'");
        }
    };
    return factory;

}]);


/*
userpaApp.factory('otipass', ['loginFactory', 'sqliteFactory', 'localStorage', '$q', '$ionicLoading', '$http', 'xml2jsonFactory', '$translate', function (loginFactory, sqliteFactory, localStorage, $q, $ionicLoading, $http, xml2jsonFactory, $translate) {
    var factory = {
        getOtipass: function () {
            $ionicLoading.show({
                templateUrl: 'templates/loadingTemplate.html'
            });
            var deferred = $q.defer();
            var numotipass = localStorage.get('numotipassNb');
            if (isOnline) {
                loginFactory.connect().then(function success(response) {
                    sqliteFactory.insertAllOtipass().then(function success(response) {
                        factory.getDatabaseOtipass().then(function success(response) {
                            loginFactory.disconnect();
                            deferred.resolve(response);
                        });
                    }, function error(response) {
                        loginFactory.disconnect();
                        deferred.resolve(factory.getDatabaseOtipass());
                    });
                }, function error(response) {
                    deferred.resolve(factory.getDatabaseOtipass());
                });
            } else {
                deferred.resolve(factory.getDatabaseOtipass());
            }
            return deferred.promise;
        },
        getDatabaseOtipass: function () {
            return sqliteFactory.getOtipass();
        },
        hasOtipass: function () {
            var deferred = $q.defer();
            sqliteFactory.getOtipass().then(function (res) {
                deferred.resolve(true);
            }, function (err) {
                deferred.resolve(false);
            });
            return deferred.promise;
        },
        associatePass: function (numotipass) {
            var deferred = $q.defer();
            var data = {
                serial: serialNumber,
                numotipass: numotipass
            };
            if (isOnline) {
                loginFactory.connect().then(function success(response) {
                    $http.post(prod.serverUrl + project + prod.urlAssociatePass, data, {params: data}).then(function success(res) {
                        var responseAPI = xml2jsonFactory.convertData(res.data);
                        if (responseAPI.response.st == 200) {
                            sqliteFactory.insertOtipass(numotipass).then(function () {
                                loginFactory.disconnect().then(function () {
                                    deferred.resolve(cOK);
                                });
                            }, function (err) {
                                loginFactory.disconnect();
                                deferred.reject(err);
                            })
                        } else {
                            loginFactory.disconnect();
                            deferred.reject(responseAPI.response.st);
                        }
                    }, function (err) {
                        loginFactory.disconnect();
                        deferred.reject(err);
                    })
                }, function (err) {
                    loginFactory.disconnect();
                    deferred.reject(err);
                });

            } else {
                deferred.resolve(false);
            }
            return deferred.promise;
        },
        getOtipassList: function () {
            var deferred = $q.defer();
            var otipassList = [];
            factory.getOtipass().then(function (result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var pass = result.rows.item(i);
                    if (pass.expiry != null) {
                        if (devicePlatform == 'ios') {
                            pass.expiry = pass.expiry.replace(/-/g, '/');
                        }
                        var expiry_date = new Date(pass.expiry);
                        navigator.globalization.dateToString(expiry_date, function (date) {
                            pass.validity = date;
                        }, function (error) {
                            var expiry_date = pass.expiry.split(' ');
                            if (expiry_date.length > 0) {
                                var validity_date = expiry_date[0].split('-');
                                if (validity_date.length > 1) {
                                    pass.validity = validity_date[2] + '/' + validity_date[1] + '/' + validity_date[0];
                                }
                            }
                        }, {formatLength: 'short', selector: 'date and time'})
                    }
                    // pass status
                    if (pass.status > 0) {
                        if (pass.status == PASS_INACTIVE) {
                            pass.status_txt = $translate.instant("pass_inactive");
                        } else if (pass.status == PASS_ACTIVE) {
                            pass.status_txt = $translate.instant("pass_active");
                        } else if (pass.status == PASS_INVALID) {
                            pass.status_txt = $translate.instant("pass_invalid");
                        } else if (pass.status == PASS_EXPIRED) {
                            pass.status_txt = $translate.instant("pass_expired")
                        } else if (pass.status == PASS_CREATED) {
                            pass.status_txt = $translate.instant("pass_created");
                        }
                    }
                    // order_pos
                    var order_pos = null;
                    sqliteFactory.getOrderPosByOtipassId(pass.idotipass).then(function success(order_pos) {
                        if (order_pos != null) {
                            pass.tariff = order_pos.price;
                            if (devicePlatform == 'ios') {
                                order_pos.date = order_pos.date.replace(/-/g, '/');
                            }
                            var order_date = new Date(order_pos.date);
                            navigator.globalization.dateToString(order_date, function (date) {
                                pass.order_date = date;
                            }, function (error) {
                                order_date = order_pos.date.split(' ');
                                if (order_date.lenght > 0) {
                                    var date_order = order_date[0].split('-');
                                    if (date_order.length > 1) {
                                        pass.order_date = date_order[2] + '/' + date_order[1] + '/' + date_order[0];
                                    }
                                }
                            }, {formatLength: 'short', selector: 'date and time'});
                        }
                    });
                    // pass pid
                    pass.type_txt = pass.name;

                    // services
                    if (pass.service != null) {
                        var servicesTmp = factory.escapeHtml(pass.service);
                        servicesTmp = servicesTmp.split(';');
                        var services = [];
                        angular.forEach(servicesTmp, function (value, key) {
                            var tmpValue = value.split(':');
                            if (tmpValue[0].length > 0 && tmpValue[1].length > 0) {
                                services.push({
                                    name: tmpValue[0],
                                    nb: tmpValue[1]
                                });
                            }
                        });
                        pass.services = services;
                    }

                    otipassList.push(pass);
                }
                deferred.resolve(otipassList);
            })
            return deferred.promise;
        },
        escapeHtml: function (text) {
            return text
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'");
        }
    };
    return factory;

}]);*/
