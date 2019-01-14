userpaApp.factory('sqliteFactory', ['$cordovaSQLite', '$http', '$q', 'xml2jsonFactory', 'imagesFactory', 'coordinatesFactory', 'localStorage', '$rootScope', '$filter', function($cordovaSQLite, $http, $q, xml2jsonFactory, imagesFactory, coordinatesFactory, localStorage, $rootScope, $filter) {
    var factory = {
        populateDatabaseOnInitUser: function() {
            var deferred = $q.defer();
            var promise1 = factory.insertAllOtipass();
            var promise2 = factory.insertOrderPos();
            var promise3 = factory.insertHolder();
            $q.all([promise1, promise2, promise3]).then(function success(response) {
                deferred.resolve(cOK);
                console.log('end of populateDatabaseOnInitUser');
            }, function error(response) {
                throw new Error('SqliteFactory - populateDatabaseOnInitUser: ' + JSON.stringify(response));
                deferred.reject(JSON.stringify(response));
            });
            return deferred.promise;
        },
        populateDatabaseOnCreateAccount: function(numotipass) {
            var deferred = $q.defer();
            var promise1 = factory.insertOtipass(numotipass);
            var promise2 = factory.insertOrderPos(numotipass);
            var promise3 = factory.insertHolder();
            $q.all([promise1, promise2, promise3]).then(function success(response) {
                deferred.resolve(cOK);
                console.log('end of populateDatabaseOnCreateAccount');
            }, function error(response) {
                throw new Error("SqliteFactory - populateDatabaseOnCreateAccount: " + JSON.stringify(response));
                deferred.reject(JSON.stringify(response));
            });
            return deferred.promise;
        },

        clearTables: function() {
            db.transaction(function(tx) {
                tx.executeSql("DELETE FROM provider", [], function(tx) {});
                tx.executeSql("DELETE FROM event", [], function(tx) {});
                tx.executeSql("DELETE FROM discount", [], function(tx) {});
            });
        },
        deleteImages: function(model, model_id, thumb) {
            var deferred = $q.defer();
            console.log("deleteImages");
            factory.getImages(model, model_id).then(function success(res) {
                if (angular.isDefined(res.rows)) {
                    for (var i = 0; i < res.rows.length; i++) {
                        var item = res.rows.item(i);
                        if (angular.isDefined(item)) {
                            imagesFactory.removeImage(model_id, item.file, thumb).then(function(success) {
                                db.executeSql('DELETE FROM media WHERE (model = ? AND model_id = ?)', [model, model_id], function(res) {
                                    deferred.resolve(cOK);
                                }, function(err) {
                                    console.log('deleteImage SQL - err: ' + err.message);
                                })
                            });
                        }
                    }
                }
            }, function(err) {
                deferred.reject(err.message);
            });
            return deferred.promise;
        },


        checkHolder: function() {
            var data = {
                serial: device.serial
            };
            var deferred = $q.defer();
            $http.post(prod.serverUrl + prod.urlHolder, data, { params: data }).then(function success(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st === '200') {
                    deferred.resolve(true);
                } else if (responseAPI.response.st === '404') {
                    deferred.resolve(false);
                } else {
                    deferred.reject("SqliteFactory - CheckHolder - responseAPI: " + responseAPI.response.st);
                }
            }, function error(err) {
                deferred.reject('SqliteFactory - CheckHolder - error: ' + JSON.stringify(err));
                console.log('checkHolder() - error: ' + error.message);
            });
            return deferred.promise;
        },
        checkOpenings: function(id_provider) {
            var deferred = $q.defer();
            var openings_exc = [];
            db.executeSql('SELECT * FROM opening_event WHERE provider_id = ?', [id_provider], function(result) {
                if (result.rows.length > 0) {
                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            }, function error(err) {
                deferred.reject("checkOpenings() err : " + err.message);
            });
            return deferred.promise;
        },

        updateUserPassword: function(iduser, cipheredPwd) {
            var query = 'UPDATE user SET password = ? WHERE iduser = ?';
            db.transaction(function(tx) {
                tx.executeSql(query, [cipheredPwd, iduser], function(res) {}, function(err) {});
            }, function(err) {
                console.log('updateUserPassword() err: ' + err.message);
            })
        },
        updateAddress: function(address) {
            var query = 'UPDATE address set address = ?, address_2 = ?, postalcode = ?, city = ?, country_code_id = ?, telephone = ?, email = ? WHERE idaddress = ?';
            db.transaction(function(tx) {
                tx.executeSql(query, [address.address, address.address2, address.postalcode, address.city, address.countryCodeId, address.telephone, address.email, address.id], function(res) {}, function(err) {});
            }, function(err) {
                console.log('updateAddress() err: ' + err.message);
            });
        },
        updatePerson: function(person) {
            var query = 'UPDATE person SET title = ?, lastname = ?, firstname = ?, language = ?, birthdate = ?, address_id = ?, user_id = ? WHERE idperson = ?';
            db.transaction(function(tx) {
                tx.executeSql(query, [person.title, person.lastName, person.firstName, person.language, person.birthDate, person.addressId, person.userId, person.id], function(res) {}, function(err) {});
            }, function(err) {
                console.log('updatePerson() err: ' + err.message);
            });
        },

        setAddress: function(address) {
            var data = xml2jsonFactory.convertJsonToXml(address);
            var deferred = $q.defer();
            var returned = {};
            $http.post(prod.serverUrl + prod.urlUploadAddress, data).then(function success(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    returned = {
                        id: responseAPI.response.id,
                        msg: 'success_upload'
                    };
                    deferred.resolve(returned);
                } else {
                    returned.msg = 'error_upload';
                    deferred.reject(returned);
                    console.log('setAddress() err API: ' + responseAPI.response.st);
                }
            }, function error(response) {
                returned.msg = 'error_upload';
                deferred.reject(returned);
                console.log('setAddress() err: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        setPerson: function(person) {
            var data = xml2jsonFactory.convertJsonToXml(person);
            var deferred = $q.defer();
            var returned = {};
            $http.post(prod.serverUrl + prod.urlUploadPerson, data).then(function success(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    returned = {
                        id: responseAPI.response.id,
                        msg: 'success_upload'
                    };
                    deferred.resolve(returned);
                } else {
                    returned.msg = 'error_upload';
                    deferred.reject(returned);
                    console.log('setPerson() err API: ' + responseAPI.response.st);
                }
            }, function error(response) {
                returned.msg = 'error_upload';
                deferred.reject(returned);
                console.log('setPerson() err: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        setUser: function(user) {
            var data = xml2jsonFactory.convertJsonToXml(user);
            var bool = angular.isString(data);
            var deferred = $q.defer();
            var returned = {};
            $http.post(prod.serverUrl + prod.urlUploadUser, data).then(function success(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    returned = {
                        id: responseAPI.response.id,
                        msg: 'success_upload'
                    };
                    deferred.resolve(returned);
                } else if (responseAPI.response.st == '403') {
                    returned.msg = 'user_exists';
                    deferred.reject(returned);
                } else {
                    returned.msg = 'error_upload';
                    deferred.reject(returned);
                }
            }, function error(response) {
                returned.msg = 'error_upload';
                deferred.reject(returned);
                console.log('setUser() err: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },

        insertPerson: function(person) {
            var query = 'INSERT INTO person (idperson, title, lastname, firstname, language, birthdate, address_id, user_id) VALUES (?,?,?,?,?,?,?,?)';
            db.transaction(function(tx) {
                tx.executeSql(query, [person.id, person.title, person.lastname, person.firstname, person.language, person.birthDate, person.addressId, person.userId], function(res) {}, function(err) {});
            }, function(err) {
                console.log('insertPerson() err: ' + err.message);
            });
        },
        insertAddress: function(address) {
            var query = 'INSERT INTO address (idaddress, address, address_2, postalcode, city, country_code_id, telephone, email) VALUES (?,?,?,?,?,?,?,?)';
            db.transaction(function(tx) {
                tx.executeSql(query, [address.idaddress, address.address, address.address2, address.postalcode, address.city, address.countryCodeId, address.telephone, address.email], function(res) {}, function(err) {})
            }, function(err) {
                console.log('insertAddress() err: ' + err.message);
            })
        },
        insertUser: function(user) {
            var deferred = $q.defer();
            var query = 'INSERT INTO user (iduser, login, password, salt, profile) VALUES (?,?,?,?,?)';
            db.transaction(function(tx) {
                tx.executeSql(query, [user.iduser, user.login, user.password, user.salt, user.profile], function(res) {
                    deferred.resolve(cOK);
                    console.log('insertUser - success: ' + JSON.stringify(res));
                }, function(err) {});
            }, function(err) {
                deferred.reject(err.message);
                console.log('insertUser() err: ' + err.message);
            }, function() {
                deferred.resolve(cOK);
            });
            return deferred.promise;
        },
        insertUsers: function(numotipass) {
            var data = {
                serial: serialNumber,
                numotipass: numotipass
            };
            var deferred = $q.defer();
            $http.post(prod.serverUrl + prod.urlUser, data, { params: data }).then(function success(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    var users = responseAPI.response.users;
                    var query = 'INSERT OR REPLACE INTO user (iduser, login, password, salt, profile) VALUES (?,?,?,?,?)';
                    db.transaction(function(tx) {
                        angular.forEach(users, function(value, key) {
                            if (value.length != undefined) {
                                for (var i = 0; i < value.length; i++) {
                                    tx.executeSql(query, [value[i].id, value[i].login, value[i].password, value[i].salt, value[i].profile], function(res) {}, function(err) {})
                                }
                            } else {
                                tx.executeSql(query, [value.id, value.login, value.password, value.salt, value.profile], function(res) {}, function(err) {})
                            }
                        });
                    }, function(error) {
                        deferred.reject("InsertUser - Transaction error: " + JSON.stringify(error));
                        console.log('insertUsers() -Transaction error: ' + error.message);
                    }, function() {
                        deferred.resolve(cOK);
                    });
                } else {
                    deferred.reject("InsertUsers - responseAPI: " + responseAPI.response.st);
                }
            }, function error(response) {
                deferred.reject("InsertUsers - getUser $http.post() error: " + JSON.stringify(response));
                console.log('insertUsers() - error: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        insertAllOtipass: function() {
            var data = {
                serial: serialNumber
            };
            var deferred = $q.defer();
            $http.post(prod.serverUrl + prod.urlGetOtipass, data, { params: data }).then(function sucessCallback(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    var passList = responseAPI.response.epass;
                    if (angular.isDefined(passList.pass)) {
                        if (passList.pass.length != undefined) {
                            db.transaction(function(tx) {
                                angular.forEach(passList.pass, function(value, key) {
                                    var query = "INSERT OR REPLACE INTO otipass (idotipass, numotipass, status, expiry, type, pid, day, service, reference, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                                    tx.executeSql(query, [value.id, value.ot, value.st, value.ex, value.ty, value.pid, value.day, value.srv, value.ref, value.package], function(res) {
                                        console.log("resolved insertOtipass");
                                        localStorage.set('numotipassNb', true);
                                        deferred.resolve(cOK);
                                    }, function(err) {
                                        console.log('Insert OTIPASS err:' + err);
                                        deferred.reject(err.message);
                                    });
                                });
                            });
                        } else {
                            db.transaction(function(tx) {
                                var value = passList.pass;
                                var query = "INSERT OR REPLACE INTO otipass (idotipass, numotipass, status, expiry, type, pid, day, service, reference, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                                tx.executeSql(query, [value.id, value.ot, value.st, value.ex, value.ty, value.pid, value.day, value.srv, value.ref, value.package], function(res) {
                                    localStorage.set('numotipassNb', true);
                                    console.log("resolved insertOtipass");
                                    deferred.resolve(cOK);
                                }, function(err) {
                                    console.log('Insert OTIPASS err:' + err.message);
                                    deferred.reject(err.message);
                                });
                            });
                        }
                    } else {
                        console.log("resolved insertOtipass");
                        deferred.resolve(cOK);
                    }
                } else {
                    console.log("resolved insertOtipass");
                    deferred.resolve(cOK);
                }
            }, function errorCallback(response) {
                deferred.reject("InsertOtipass - $http.post(): " + JSON.stringify(response));
                console.log('insertOtipass() - error: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        insertOtipass: function(numotipass) {
            var data = {
                serial: serialNumber,
                numotipass: numotipass
            };
            var deferred = $q.defer();
            $http.post(prod.serverUrl + prod.urlGetOtipass, data, { params: data }).then(function sucessCallback(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    var epass = responseAPI.response.epass;
                    if (Object.keys(epass.pass).length > 0) {
                        db.transaction(function(tx) {
                            angular.forEach(epass, function(value, key) {
                                if (key === 'pass') {
                                    var query = "INSERT OR REPLACE INTO otipass (idotipass, numotipass, status, expiry, type, pid, day, service, reference, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                                    tx.executeSql(query, [value.id, value.ot, value.st, value.ex, value.ty, value.pid, value.day, value.srv, value.ref, value.package], function(res) {}, function(err) {
                                        console.log('Insert OTIPASS err:' + err.message);
                                    });
                                }
                            });
                        }, function(error) {
                            deferred.reject("InsertOtipass - Transaction error: " + JSON.stringify(error));
                            console.log('insertOtipass() - Transaction error: ' + error.message);
                        }, function() {
                            deferred.resolve(cOK);
                        });
                    }
                } else {
                    deferred.resolve(cOK);
                }
            }, function errorCallback(response) {
                deferred.reject("InsertOtipass - $http.post(): " + JSON.stringify(response));
                console.log('insertOtipass() - error: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        insertOrderPos: function(numotipass) {
            var data = {
                serial: serialNumber,
                numotipass: numotipass
            };
            var deferred = $q.defer();
            $http.post(prod.serverUrl + prod.urlGetOtipass, data, { params: data }).then(function sucessCallback(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    var epass = responseAPI.response.epass;
                    if (angular.isDefined(epass.sale) && epass.sale !== "" && epass.sale !== null) {
                        if (epass.sale.length != undefined) {
                            if (Object.keys(epass.sale).length > 0) {
                                db.transaction(function(tx) {
                                    for (var i = 0; i < epass.sale.length; i++) {
                                        var query = 'INSERT OR REPLACE INTO order_pos (date, price, otipass_id, provider) VALUES (?, ?, ?, ?)';
                                        tx.executeSql(query, [epass.sale[i].date, epass.sale[i].price, epass.pass[i].id, epass.sale[i].provider], function(res) {
                                            console.log("resolved insertOrder");
                                            deferred.resolve(cOK);
                                        }, function(err) {
                                            console.log('Insert ORDER_POS err: ' + err.message);
                                        });
                                    }
                                }, function(error) {
                                    deferred.reject("InsertOrderPos - Transaction error: " + JSON.stringify(error));
                                    console.log('insertOrderPos() - Transaction error: ' + error.message);
                                });
                            } else {
                                console.log("resolved insertOrder");
                                deferred.resolve(cOK);
                            }

                        } else {
                            db.transaction(function(tx) {
                                var value = epass;
                                var query = 'INSERT OR REPLACE INTO order_pos (date, price, otipass_id, provider) VALUES (?, ?, ?, ?)';
                                tx.executeSql(query, [epass.sale.date, epass.sale.price, epass.pass.id, epass.sale.provider], function(res) {
                                    console.log("resolved insertOrderPos");
                                    deferred.resolve(cOK);
                                }, function(err) {
                                    console.log('Insert order_pos err:' + err);
                                    deferred.reject(err.message);
                                });
                            });
                        }
                    } else {
                        console.log("resolved insertOrder");
                        deferred.resolve(cOK);
                    }
                } else {
                    console.log("resolved insertOrder");
                    deferred.resolve(cOK);
                }
            }, function errorCallback(response) {
                deferred.reject("InsertOrderPos - $http.post(): " + JSON.stringify(response));
                console.log('insertOrderPos() - error: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        insertOpenings: function() {
            var deferred = $q.defer();
            $http.post(prod.serverUrl + prod.urlOpenings).then(function successCallback(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == 200) {
                    var durations = responseAPI.response.opening_events;
                    if (durations != "") {
                        var query = "INSERT OR REPLACE INTO opening_event(idopening_event, provider_id, className, start, end, dow, nth) VALUES (?,?,?,?,?,?,?);";
                        var query2 = "INSERT OR REPLACE INTO opening_exception(idopening_exception, opening_event_id, type, start, end, provider_id) VALUES (?,?,?,?,?,?);";
                        db.transaction(function(tx) {
                            tx.executeSql('DELETE FROM opening_event');
                            tx.executeSql('DELETE FROM opening_exception');
                            angular.forEach(durations, function(value, key) {
                                if (value.length != undefined) {
                                    for (var i = 0; i < value.length; i++) {
                                        var dow = JSON.stringify(value[i].dow);
                                        var nth = JSON.stringify(value[i].nth);
                                        var counter = i;
                                        tx.executeSql(query, [value[i].idopening_event, value[i].provider_id, value[i].class_name, value[i].start, value[i].end, dow, nth], function(tx, res) {


                                        }, function(err) {
                                            console.log('Insert EVENT err: ' + err.message);
                                            deferred.reject('Insert EVENT err: ' + err.message);
                                        });
                                        if (angular.isDefined(value[counter].except)) {
                                            if (value[counter].except != undefined && value[counter].except != "" && value[counter].except != null) {
                                                var exceptTab = [];
                                                angular.forEach(value[counter].except, function(element) {
                                                    exceptTab.push(element);
                                                });
                                                if (exceptTab.length != undefined) {
                                                    for (var j = 0; j < exceptTab.length; j++) {
                                                        tx.executeSql(query2, [exceptTab[j].idopening_exception, exceptTab[j].opening_event_id, exceptTab[j].type, exceptTab[j].start, exceptTab[j].end, value[i].provider_id], function(res) {}, function(err) {
                                                            console.log('InsertOpenings - Insert opening_exception error: ' + JSON.stringify(err));
                                                        });
                                                    }
                                                }
                                            }
                                        } else {
                                            //deferred.resolve(cOK);
                                        }

                                    }
                                    deferred.resolve(cOK);
                                } else {
                                    var dow = JSON.stringify(value.dow);
                                    var nth = JSON.stringify(value.nth);
                                    tx.executeSql(query, [value.idopening_event, value.provider_id, value.class_name, value.start, value.end, dow, nth], function(tx, res) {
                                        if (value.except != undefined && value.except != "" && value.except != null) {
                                            var exceptTab = [];
                                            angular.forEach(value.except, function(element) {
                                                exceptTab.push(element);
                                            });
                                            if (exceptTab.length != undefined) {
                                                for (var j = 0; j < exceptTab.length; j++) {
                                                    tx.executeSql(query2, [exceptTab[j].idopening_exception, exceptTab[j].opening_event_id, exceptTab[j].type, exceptTab[j].start, exceptTab[j].end, value.provider_id], function(res) {}, function(err) {
                                                        console.log('Insert opening_exception err: ' + err.message);
                                                    });
                                                }
                                            }
                                        } else {
                                            deferred.resolve(cOK);
                                        }
                                        deferred.resolve(cOK);

                                    }, function(err) {
                                        console.log('Insert OPENING err: ' + err.message);
                                        deferred.reject('Insert OPENING err: ' + err.message);
                                    });
                                }
                            });
                        }, function(error) {
                            deferred.reject(error.message);
                            console.log('insertOpening - Transaction error: ' + error.message);
                        });
                    } else {
                        deferred.resolve(durations);
                    }
                }
            }, function error(response) {
                deferred.reject('InsertOpening - $http.post(): ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        insertEventList: function() {
            var deferred = $q.defer();
            var promises = [];
            var needsSync = true;
            var internHighest;
            var data = {
                serial: serialNumber
            };
            db.executeSql('SELECT * FROM event  ORDER BY idevent DESC LIMIT 1', [], function(res) {
                if (res.rows.item(0) !== undefined) {
                    var result = res.rows.item(0);
                    data.lastId = result.idevent;
                }
                $http.post(prod.serverUrl + prod.urlGetEventByProvider, data, { params: data }).then(function successCallback(response) {
                    var responseAPI = xml2jsonFactory.convertData(response.data);
                    if (responseAPI.response.st == 200) {
                        if (responseAPI.response.events === "") {
                            deferred.resolve(false);
                        } else {
                            var events = responseAPI.response.events;
                            var query = 'INSERT OR REPLACE INTO event (idevent, name, description, type, start_date, end_date, place_name, address_id, provider_id) VALUES (?,?,?,?,?,?,?,?,?);'
                            db.transaction(function(tx) {
                                angular.forEach(events, function(value, key) {
                                    if (value.length != undefined) {
                                        for (var i = 0; i < value.length; i++) {
                                            tx.executeSql(query, [value[i].idevent, value[i].name, value[i].description, value[i].type, value[i].start_date, value[i].end_date, value[i].place_name, value[i].address_id, value[i].provider_id], function(res) {
                                                localStorage.set('newEvents', "true");
                                                deferred.resolve(true);
                                            }, function(err) {
                                                console.log('Insert EVENT err: ' + JSON.stringify(err));
                                            });
                                        }
                                    } else {
                                        tx.executeSql(query, [value.idevent, value.name, value.description, value.type, value.start_date, value.end_date, value.place_name, value.address_id, value.provider_id], function(res) {
                                            localStorage.set('newEvents', "true");
                                            deferred.resolve(true);
                                        }, function(err) {
                                            console.log('Insert EVENT err: ' + JSON.stringify(err));
                                        });
                                    }
                                });
                            }, function(error) {
                                deferred.reject('InsertEventList - Transaction error: ' + JSON.stringify(error));
                                console.log('InsertEventList - Transaction error: ' + JSON.stringify(error));
                            });
                        }
                    }
                }, function error(response) {
                    deferred.reject('GetEventByProvider error: ' + JSON.stringify(error));
                });
            });
            return deferred.promise;
        },
        insertProviders: function(lastUpdate, file_last_update) {
            return factory.insertProvidersStatement(lastUpdate, file_last_update)
                .then(factory.downloadProvidersImg);
        },
        insertProvidersStatement: function(lastUpdate, file_last_update) {
            var data = {
                serial: serialNumber,
                last_update: lastUpdate,
                file_last_update: file_last_update
            };
            var deferred = $q.defer();
            var promises = [];
            var files = [];
            $http.post(prod.serverUrl + prod.urlProviders, data, { params: data }).then(function successCallback(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    promises.push(imagesFactory.createDir());
                    var museums = responseAPI.response.museums;
                    var query = 'INSERT OR REPLACE INTO provider (idprovider, name, description_fr, description_en, long_description_fr, long_description_en, provider_category_id, category, website, last_update, address_id, address, address_2, postalcode, city, country_code_id, telephone, email, latitude, longitude, active, external_ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);'
                    if (museums == "") {
                        deferred.resolve(false);
                    }
                    db.transaction(function(tx) {
                        angular.forEach(museums, function(value, key) {
                            var percentageToAdd = 30 / museums.museum.length;
                            percentageToAdd = $filter('number')(percentageToAdd, 2);
                            percentageToAdd = parseFloat(percentageToAdd.replace(",", "."));
                            if (value.length != undefined) {
                                for (var i = 0; i < value.length; i++) {
                                    tx.executeSql(query, [value[i].idprovider, value[i].name, value[i].description_fr, value[i].description_en, value[i].long_description_fr, value[i].long_description_en, value[i].provider_category_id, value[i].category, value[i].website, value[i].last_update, value[i].address_id, value[i].address, value[i].address_2, value[i].postalcode, value[i].city, value[i].country_code_id, value[i].telephone, value[i].email, value[i].latitude, value[i].longitude, value[i].active, value[i].external_ref], function(res) {}, function(err) {
                                        console.log('Insert PROVIDER err: ' + err.message);
                                    });
                                    if (value[i].files && value[i].files.file) {
                                        if (value[i].files.file.length > 0) {
                                            angular.forEach(value[i].files.file, function(v, k) {
                                                files.push(v);
                                            })
                                        } else {
                                            files.push(value[i].files.file);
                                        }
                                    }
                                    $rootScope.loaderValueInit += +(percentageToAdd);
                                }
                            } else {
                                tx.executeSql(query, [value.idprovider, value.name, value.description_fr, value.description_en, value.long_description_fr, value.long_description_en, value.provider_category_id, value.category, value.website, value.last_update, value.address_id, value.address, value.address_2, value.postalcode, value.city, value.country_code_id, value.telephone, value.email, value.latitude, value.longitude, value.active, value.external_ref], function(res) {}, function(err) {
                                    console.log('Insert PROVIDER err: ' + err.message);
                                });
                                if (value.files && value.files.file) {
                                    if (value.files.file.length > 0) {
                                        angular.forEach(value.files.file, function(v, k) {
                                            files.push(v);
                                        })
                                    } else {
                                        files.push(value.files.file);
                                    }
                                }
                                $rootScope.loaderValueInit += +(percentageToAdd);
                            }
                        });
                        $q.all(promises).then(function success(response) {
                            coordinatesFactory.isGPSEnabled().then(function success(enabled) {
                                if (enabled) {
                                    coordinatesFactory.getProviderDistance(museums);
                                }
                            });
                            deferred.resolve(files);
                        }, function error(response) {
                            console.log(JSON.stringify(response));
                            deferred.reject(JSON.stringify(response));
                        });
                    }, function(error) {
                        deferred.reject(error.message);
                        console.log('InsertProvider - Transaction error: ' + error.message);
                    });
                } else {
                    deferred.resolve(cOK);
                }
            }, function errorCallback(response) {
                deferred.reject(JSON.stringify(response));
                console.log('insertProvider() - getProviders - error: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        downloadProvidersImg: function(files) {
            var deferred = $q.defer();
            var promises = [];
            var percentageToAdd = 30 / files.length;
            percentageToAdd = $filter('number')(percentageToAdd, 2);
            $rootScope.percentageToAdd = parseFloat(percentageToAdd.replace(",", "."));
            var query = 'INSERT OR REPLACE INTO media (idmedia, model, model_id, file, thumb, position, last_update) VALUES (?,?,?,?,?,?,?)';
            db.transaction(function(tx) {
                angular.forEach(files, function(v, k) {
                    tx.executeSql('DELETE FROM media WHERE (model = ? AND model_id = ?)', ['provider', v.model_id], function(res) {
                        tx.executeSql(query, [v.idmedia, v.model, v.model_id, v.file, v.thumb, v.position, v.last_update], function(res) {
                            promises.push(imagesFactory.downloadImages(v.model_id, v.file, 'providers', true));
                        }, function(err) {
                            console.log('Insert PROVIDER - MEDIA - err: ' + err.message);
                        });
                    }, function(err) {
                        console.log('Insert PROVIDER - MEDIA - err: ' + err.message);
                    })
                });
            });
            $q.all(promises).then(function success(res) {
                deferred.resolve(cOK);
            }, function error(err) {
                deferred.reject(err);
                console.log(JSON.stringify(err));
            });
            return deferred.promise;
        },
        insertDiscounts: function(last_update) {
            var data = {};
            if (angular.isDefined(last_update)) {
                data = {
                    last_update: last_update
                }
            }
            var deferred = $q.defer();
            $http.post(prod.serverUrl + prod.urlGetDiscount, data, { params: data }).then(function success(response) {

                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st == '200') {
                    var discounts = responseAPI.response.discounts.discount;
                    if (discounts.length > 0) {
                        db.transaction(function(tx) {
                            for (var i = 0; i < discounts.length; i++) {
                                if (!angular.isDefined(discounts[i].name.fr)) {
                                    discounts[i].name.fr = "";
                                }
                                if (!angular.isDefined(discounts[i].description.fr)) {
                                    discounts[i].description.fr = "";
                                }
                                if (!angular.isDefined(discounts[i].name.de)) {
                                    discounts[i].name.de = "";
                                }
                                if (!angular.isDefined(discounts[i].description.de)) {
                                    discounts[i].description.de = "";
                                }
                                if (!angular.isDefined(discounts[i].name.en)) {
                                    discounts[i].name.en = "";
                                }
                                if (!angular.isDefined(discounts[i].description.en)) {
                                    discounts[i].description.en = "";
                                }
                                var query = 'INSERT OR REPLACE INTO discount (iddiscount, provider_id, price, amount, name_fr, name_de, name_en, description_fr, description_de, description_en, last_update) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                                tx.executeSql(query, [discounts[i].id, discounts[i].provider_id, discounts[i].price, discounts[i].amount, discounts[i].name.fr, discounts[i].name.de, discounts[i].name.en, discounts[i].description.fr, discounts[i].description.de, discounts[i].description.en, discounts[i].last_update], function(res) {}, function(err) {
                                    console.log('Insert DISCOUNT err: ' + err.message);
                                });
                            };
                        }, function(error) {
                            deferred.reject(error.message);
                            console.log('insertDiscountList() - Transaction error: ' + error.message);
                        }, function() {
                            deferred.resolve(cOK);
                        });
                    }
                } else {
                    deferred.resolve(cOK);
                }
            }, function errorCallback(response) {
                deferred.reject(JSON.stringify(response));
                console.log('insertDiscounts() - error: ' + JSON.stringify(response));
            });


            return deferred.promise;
        },
        insertHolder: function() {
            var data = {
                serial: serialNumber
            };
            var deferred = $q.defer();
            $http.post(prod.serverUrl + prod.urlHolder, data, { params: data }).then(function successCallback(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st === '200') {
                    var user = responseAPI.response.user;
                    var haddress = responseAPI.response.haddress;
                    var person = responseAPI.response.person;
                    var userCountQuery = 'SELECT COUNT(iduser) as nb_user FROM user';
                    var userQuery = 'INSERT OR REPLACE INTO user (iduser, login, password, salt, profile) VALUES (?,?,?,?,?)';
                    var haddressQuery = 'INSERT OR REPLACE INTO address (idaddress, address, address_2, postalcode, city, country_code_id, telephone, email) VALUES (?,?,?,?,?,?,?,?)';
                    var personQuery = 'INSERT OR REPLACE INTO person (idperson, title, lastname, firstname, language, birthdate, address_id, user_id) VALUES (?,?,?,?,?,?,?,?)';
                    db.transaction(function(tx) {
                        tx.executeSql(userCountQuery, [], function(tx, res) {
                            if (res.rows.item(0).nb_user == 1 && user.id.length > 0) {
                                tx.executeSql(userQuery, [user.id, user.login, user.password, user.salt, user.profile], function(res) {}, function(err) {
                                    console.log('Insert USER err: ' + err.message);
                                });
                            }
                        });
                        if(haddress.id !== "" && haddress.id !== null && angular.isDefined(haddress.id)) {
                            tx.executeSql(haddressQuery, [haddress.id, haddress.address, haddress.address2, haddress.postalCode, haddress.city, haddress.countryCodeId, haddress.telephone, haddress.email], function (res) {
                            }, function (err) {
                                console.log('Insert HADDRESS err: ' + err.message);
                            });
                        }
                        if(person.id !== "" && person.id !== null && angular.isDefined(person.id)) {
                            tx.executeSql(personQuery, [parseInt(person.id), person.title, person.lastName, person.firstName, person.language, person.birthDate, haddress.id, user.id], function (res) {
                                localStorage.set('name', person.firstName);
                                localStorage.set('lastName', person.lastName);
                            }, function (err) {
                                console.log('Insert PERSON err: ' + err.message);
                            })
                        }
                    }, function(err) {
                        deferred.reject(err.message);
                        console.log('Insert HOLDER transaction err: ' + err.message);
                    }, function() {
                        deferred.resolve(cOK);
                    });
                } else {
                    console.log("resolved insertHolder");
                    deferred.resolve(cOK);

                }
            }, function errorCallback(response) {
                deferred.reject(JSON.stringify(response));
                console.log('insertHolder() - getHolder - error: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        insertPages: function(lastUpdate, fileLastUpdate) {
            var deferred = $q.defer();
            var promises = [];
            var data = { last_update: lastUpdate, file_last_update: fileLastUpdate };
            $http.post(prod.serverUrl + prod.urlPages, data).then(function successCallback(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI) {
                    if (responseAPI.response.st == '200') {
                        promises.push(imagesFactory.createDir());
                        var pages = responseAPI.response.pages;
                        var query = 'INSERT OR REPLACE INTO page (idpage, title_fr, title_en, subtitle_fr, subtitle_en, content_fr, content_en, slug, last_update) VALUES (?,?,?,?,?,?,?,?,?)';
                        var query2 = 'INSERT OR REPLACE INTO media (idmedia, model, model_id, file, thumb, content_fr, content_en, position, url, last_update) VALUES (?,?,?,?,?,?,?,?,?,?)';
                        db.transaction(function(tx) {
                            angular.forEach(pages, function(value, key) {
                                var valueLength = value.length;
                                if (valueLength !== undefined) {
                                    for (var i = 0; i < valueLength; i++) {
                                        tx.executeSql(query, [value[i].idpage, value[i].title_fr, value[i].title_en, value[i].subtitle_fr, value[i].subtitle_en, value[i].content_fr, value[i].content_en, value[i].slug, value[i].last_update], function(res) {}, function(err) {
                                            console.log('Insert PAGES err: ' + err.message);
                                        });
                                        if (value[i].files) {
                                            angular.forEach(value[i].files, function(v, k) {
                                                tx.executeSql(query2, [v.idmedia, v.model, v.model_id, v.file, v.thumb, v.content, v.content, v.position, v.url, v.last_update], function(res) {}, function(err) {
                                                    console.log('Insert PAGES - Media - err: ' + err.message);
                                                })
                                                promises.push(imagesFactory.downloadImages(v.model_id, v.file, 'pages', true));
                                            })
                                        }
                                    }
                                } else {
                                    tx.executeSql(query, [value.idpage, value.title_fr, value.title_en, value.subtitle_fr, value.subtitle_en, value.content_fr, value.content_en, value.slug, value.last_update], function(res) {}, function(err) {
                                        console.log('Insert PAGES err: ' + err.message);
                                    });
                                    if (value.files) {
                                        angular.forEach(value.files, function(v, k) {
                                            tx.executeSql(query2, [v.idmedia, v.model, v.model_id, v.file, v.thumb, v.content, v.content, v.position, v.url, v.last_update], function(res) {}, function(err) {
                                                console.log('Insert PAGES - Media - err: ' + err.message);
                                            })
                                            promises.push(imagesFactory.downloadImages(v.model_id, v.file, 'pages', true));
                                        })
                                    }
                                }
                            });
                        }, function(error) {
                            deferred.reject("InsertPages - Transaction error: " + JSON.stringify(error));
                            console.log('insertPages() - Transaction error: ' + error.message);
                        });
                        $q.all(promises).then(function success(response) {
                            deferred.resolve(cOK);
                        }, function error(response) {
                            console.log(JSON.stringify(response));
                            deferred.reject("insertPages - $q.all(): " + JSON.stringify(response));
                        })
                    } else {
                        deferred.resolve(cOK);
                    }
                } else {
                    console.log('InsertPages - responseAPI is null');
                    deferred.reject('InsertPages - responseAPI is null');
                }
            }, function errorCallback(response) {
                deferred.reject(JSON.stringify(response));
                console.log('InsertPages() - $http.post(): ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        insertAdvertisements: function(lastId, fileLastUpdate) {
            var deferred = $q.defer();
            var data = {
                last_id: lastId,
                file_last_update: fileLastUpdate
            };
            var promises = [];
            $http.post(prod.serverUrl + prod.urlAdvertisement, data, { params: data }).then(function successCallback(response) {
                var responseAPI = xml2jsonFactory.convertData(response.data);
                if (responseAPI.response.st = '200') {
                    promises.push(imagesFactory.createDir());
                    var advertisements = responseAPI.response.advertisements;
                    if (advertisements == "") {
                        deferred.resolve(false);
                    }
                    var query = 'INSERT OR REPLACE INTO advertisement (idadvertisement, start_date, end_date) VALUES (?,?,?)';
                    var query2 = 'INSERT OR REPLACE INTO media (idmedia, model, model_id, file, thumb, content_fr, content_en, position, url, last_update) VALUES (?,?,?,?,?,?,?,?,?,?)';
                    db.transaction(function(tx) {
                        angular.forEach(advertisements, function(value, key) {
                            if (angular.isDefined(value.length)) {
                                for (var i = 0; i < value.length; i++) {
                                    tx.executeSql(query, [value[i].idadvertisement, value[i].start_date, value[i].end_date], function(res) {}, function(err) {
                                        console.log('Insert advertisement - err: ' + err.message);
                                    });
                                    if (value[i].files) {
                                        angular.forEach(value[i].files, function(v, k) {
                                            if (v.length > 0) {
                                                for (var i = 0; i < v.length; i++) {
                                                    tx.executeSql(query2, [v[i].idmedia, v[i].model, v[i].model_id, v[i].file, v[i].thumb, v[i].description_fr, (angular.isDefined(v[i].description_en) ? v[i].description_en : null), v[i].position, (angular.isDefined(v[i].url) ? v[i].url : null), v[i].last_update], function(res) {}, function(err) {
                                                        console.log('Insert advertisement - MEDIA - err: ' + err.message);
                                                    });
                                                    promises.push(imagesFactory.downloadImages(v[i].model_id, v[i].file, 'advertisements', false));
                                                }
                                            } else {
                                                tx.executeSql(query2, [v.idmedia, v.model, v.model_id, v.file, v.thumb, v.description_fr, (angular.isDefined(v.description_en) ? v.description_en : null), v.position, (angular.isDefined(v.url) ? v.url : null), v.last_update], function(res) {}, function(err) {
                                                    console.log('Insert advertisement - MEDIA - err: ' + err.message);
                                                });
                                                promises.push(imagesFactory.downloadImages(v.model_id, v.file, 'advertisements', false));
                                            }

                                        });
                                    }
                                }
                            } else {
                                tx.executeSql(query, [value.idadvertisement, value.start_date, value.end_date], function(res) {}, function(err) {
                                    console.log('Insert advertisement - err: ' + err.message);
                                });
                                if (value.files) {
                                    angular.forEach(value.files, function(v, k) {
                                        if (v.length > 0) {
                                            for (var i = 0; i < v.length; i++) {
                                                tx.executeSql(query2, [v[i].idmedia, v[i].model, v[i].model_id, v[i].file, v[i].thumb, v[i].description_fr, (angular.isDefined(v[i].description_en) ? v[i].description_en : null), v[i].position, (angular.isDefined(v[i].url) ? v[i].url : null), v[i].last_update], function(res) {}, function(err) {
                                                    console.log('Insert advertisement - MEDIA - err: ' + err.message);
                                                });
                                                promises.push(imagesFactory.downloadImages(v[i].model_id, v[i].file, 'advertisements', false));
                                            }
                                        } else {
                                            tx.executeSql(query2, [v.idmedia, v.model, v.model_id, v.file, v.thumb, v.description_fr, (angular.isDefined(v.description_en) ? v.description_en : null), v.position, (angular.isDefined(v.url) ? v.url : null), v.last_update], function(res) {}, function(err) {
                                                console.log('Insert advertisement - MEDIA - err: ' + err.message);
                                            });
                                            promises.push(imagesFactory.downloadImages(v.model_id, v.file, 'advertisements', false));
                                        }

                                    });
                                }
                            }
                        });
                        $q.all(promises).then(function success(response) {
                            deferred.resolve(cOK);
                        }, function error(error) {
                            deferred.reject(JSON.stringify(error));
                            console.log(JSON.stringify(error));
                        });
                    }, function(error) {
                        deferred.reject(error.message);
                        console.log('Insert Advertisements - Transaction error: ' + error.message);
                    });
                } else {
                    deferred.reject(cErr);
                }
            }, function errorCallback(response) {
                deferred.reject(JSON.stringify(response));
                console.log('InsertAdvertisement() - getAdvertisements - error: ' + JSON.stringify(response))
            })
            return deferred.promise;
        },

        getUserEmail: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT email FROM address', [], function(res) {
                deferred.resolve(res.rows.item(0));
            }, function(err) {
                deferred.reject(err.message);
            });
            return deferred.promise;
        },
        getEventList: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM event', [], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.reject('No data found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getEventList() err: ' + err.message);
            });
            return deferred.promise;
        },
        getPageBySlug: function(slug) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM page WHERE slug LIKE ?', [slug], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.reject('No page found with slug: ' + slug);
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getPageBySlug() err: ' + err.message);
            });
            return deferred.promise;
        },
        getImages: function(model, model_id) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM media WHERE (model = ? AND model_id = ?) ORDER BY position ASC', [model, model_id], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.resolve({});
                    console.log('no images found: ' + model + ' - ' + model_id);
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getImages() err: ' + err.message);
            });
            return deferred.promise;
        },
        getThumbImage: function(model, model_id) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM media WHERE (model = ? AND model_id = ?) AND thumb = 1', [model, model_id], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.resolve('');
                    console.log('no thumb found: ' + model + ' - ' + model_id);
                }
            }, function(err) {
                deferred.relect(err.message);
                console.log('getThumbImage() err:' + err.message);
            });
            return deferred.promise;
        },
        getAdvertisements: function(date) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM advertisement WHERE end_date >= ?', [date], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.resolve(false);
                }
            }, function(err) {
                deferred.reject(err);
                console.log('getAdvertisement() - err: ' + err.message);
            });
            return deferred.promise;
        },
        getOtipass: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM otipass', [], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.reject('No data found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getOtipass() err: ' + err.message);
            });
            return deferred.promise;
        },
        getNumotipass: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT numotipass FROM otipass', [], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.reject('No numotipass found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getNumotipass() err: ' + err.message);
            });
            return deferred.promise;
        },
        getOrderPosByOtipassId: function(otipass_id) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM order_pos WHERE otipass_id = ?', [otipass_id], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.reject('No data found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getOrderPosByOtipassId() err: ' + err.message);
            });
            return deferred.promise;
        },
        getProviderList: function(filter) {
            var deferred = $q.defer();
            var query;
            if (filter == "" || !angular.isDefined(filter)) {
                query = 'SELECT * FROM provider JOIN media m ON (m.model="provider" AND m.model_id=provider.idprovider AND m.thumb=1) WHERE provider.active = 1 AND (provider_category_id = ' + CAT_PROVIDER + ' OR provider_category_id = ' + CAT_PROVIDER_POS + ')';
            } else {
                query = 'SELECT * FROM provider JOIN media m ON (m.model="provider" AND m.model_id=provider.idprovider AND m.thumb=1) WHERE provider.active = 1 AND provider_category_id = ' + CAT_RETAILER;

            }
            db.executeSql(query, [], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.resolve(false);
                    console.log('No Providers found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getProviderList() err: ' + err.message);
            });
            return deferred.promise;
        },
        getProviderByReference: function(reference) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM provider WHERE external_ref = ? AND active = 1', [reference], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.reject('No provider fount with reference: ' + reference);
                }
            }, function(err) {
                deferred.reject(err);
                console.log('getProviderByReference() err: ' + err.message);
            });
            return deferred.promise;
        },
        getProviderById: function(idprovider) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM provider WHERE idprovider = ? AND active = 1', [idprovider], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.reject('No provider found with ID: ' + idprovider);
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getProviderById() err: ' + err.message);
            });
            return deferred.promise;
        },
        getProvidersCoordinates: function(idprovider) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM provider WHERE idprovider != ? AND active = 1', [idprovider], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.reject('No provider found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getProvidersCoordinates error: ' + err.message);
            });
            return deferred.promise;
        },
        getProviderName: function(idprovider) {
            var deferred = $q.defer();
            db.executeSql('SELECT name FROM provider WHERE idprovider = ? AND active = 1', [idprovider], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.reject('No provider found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getProviderName error: ' + JSON.stringify(err));
            });
            return deferred.promise;
        },
        getOpeningsByProvider: function(id_provider) {
            var deferred = $q.defer();
            var promises = [];
            var openings = [];
            var exceptions = [];
            promises.push(factory.getExceptionsByProvider(id_provider));
            promises.push(factory.getOpeningEventByProvider(id_provider));
            $q.all(promises).then(function(values) {
                exceptions = values[0];
                openings = values[1];
                angular.forEach(openings, function(opening) {
                    opening.except = [];
                    angular.forEach(exceptions, function(exception) {
                        if (exception.opening_event_id === opening.idopening_event) {
                            opening.except.push(exception);
                        }
                    });
                    if (opening.except.length === 0) {
                        delete opening.except;
                    }
                });
                deferred.resolve(openings);
            }, function err(err) {
                deferred.reject('getOpenings() err' + err.message);
            });
            return deferred.promise;
        },
        getExceptionsByProvider: function(id_provider) {
            var deferred = $q.defer();
            var openings_exc = [];
            db.executeSql('SELECT * FROM opening_exception WHERE provider_id = ?', [id_provider], function(result) {
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        openings_exc.push(result.rows.item(i));
                    }
                }
                deferred.resolve(openings_exc);
            }, function error(err) {
                console.log(err);
                deferred.reject('getOpeningExceptions() err: ' + err);
            });
            return deferred.promise;
        },
        getOpeningEventByProvider: function(id_provider) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM opening_event WHERE provider_id = ?', [id_provider], function(res) {
                var openings = [];
                if (res.rows.length > 0) {
                    for (var j = 0; j < res.rows.length; j++) {
                        var op = res.rows.item(j);
                        var dowTemp = [];
                        op.dow = JSON.parse(op.dow);
                        if (op.dow !== "") {
                            angular.forEach(op.dow, function(value, key) {
                                key = key.substring(1);
                                dowTemp[key] = parseInt(value, 10);
                            });
                            op.dow = dowTemp;
                        }
                        op.nth = JSON.parse(op.nth);
                        var nthTemp = [];
                        if (op.nth !== "") {
                            angular.forEach(op.nth, function(value, key) {
                                key = key.substring(1);
                                nthTemp[key] = parseInt(value, 10);
                            });
                            op.nth = nthTemp;
                        }
                        if (op.start.length > 10) {
                            op.title = op.start.substring(10) + " - " + op.end.substring(10);

                        } else {
                            op.title = op.start + " - " + op.end;
                        }
                        if (op.nth.length === 0) {
                            delete op.nth;
                        }
                        if (op.dow.length === 0) {
                            delete op.dow;
                        }
                        openings.push(op);
                    }
                    deferred.resolve(openings);
                } else {
                    deferred.resolve(openings);
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getOpening() err: ' + err.message);
            });
            return deferred.promise;
        },
        getEventByProvider: function(providerid) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM event WHERE provider_id = ? ORDER BY event.start_date ASC', [providerid], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.reject('No data found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getEventByProvider() err: ' + err.message);
            });
            return deferred.promise;
        },
        getDiscountByProvider: function(providerid) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM discount WHERE provider_id = ?', [providerid], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res);
                } else {
                    deferred.reject('No data found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getDiscountByProvider() err: ' + err.message);
            });
            return deferred.promise;
        },
        getLastUpdate: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT MAX(provider.last_update) AS lastUpdate, MAX(m.last_update) AS file_last_update FROM provider JOIN media m ON (m.model="provider")', [], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.reject('No last update found');
                }
            }, function(err) {
                deferred.reject(JSON.stringify(err));
                console.log('getLastUpdate error: ' + JSON.stringify(err));
            });
            return deferred.promise;
        },
        getAdLastId: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT MAX(advertisement.idadvertisement) AS lastId, MAX(m.last_update) AS file_last_update FROM advertisement JOIN media m ON (m.model="advertisement")', [], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.reject('No last update found');
                }
            }, function(err) {
                deferred.reject(JSON.stringify(err));
                console.log('getLastUpdate error: ' + JSON.stringify(err));
            });
            return deferred.promise;
        },
        getPerson: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM person', [], function(res) {
                deferred.resolve(res);
            }, function(err) {
                deferred.reject(err.message);
                console.log('getPerson() err: ' + err.message);
            });
            return deferred.promise;
        },
        getAddress: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM address', [], function(res) {
                deferred.resolve(res);
            }, function(err) {
                deferred.reject(err.message);
                console.log('getAddress() err: ' + err.message);
            });
            return deferred.promise;
        },
        getAddressById: function(idAddress) {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM address WHERE idaddress = ?', [idAddress], function(res) {
                deferred.resolve(res);
            }, function(err) {
                deferred.reject(err.message);
                console.log('getAddress() err: ' + err.message);
            });
            return deferred.promise;
        },
        getPersonWithAddress: function() {
            var deferred = $q.defer();
            db.executeSql('SELECT * FROM person JOIN address ON person.address_id = address.idaddress', [], function(res) {
                deferred.resolve(res);
            }, function(err) {
                deferred.reject(err.message);
                console.log('getPersonWithAddress() err: ' + err.message);
            });
            return deferred.promise;
        },
        getUser: function() {
            // get user witch is not device user
            var deferred = $q.defer();
            console.log(serialNumber);
        
            db.executeSql('SELECT * FROM user WHERE login != ?', [serialNumber], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.reject('No user found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getUser() err: ' + err.message);
            });
            return deferred.promise;
        },
        getUserDevice: function() {
            var deferred = $q.defer();
            console.log(serialNumber);
            db.executeSql('SELECT * FROM user WHERE login = ?', [serialNumber], function(res) {
                if (res.rows.length > 0) {
                    deferred.resolve(res.rows.item(0));
                } else {
                    deferred.reject('No user found');
                }
            }, function(err) {
                deferred.reject(err.message);
                console.log('getUserDevice err: ' + err.message);
            });
            return deferred.promise;
        }

    };
    return factory;
}]);
