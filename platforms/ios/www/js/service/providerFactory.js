userpaApp.factory('providerFactory', ['snackbar', '$translate', '$q', 'sqliteFactory', '$rootScope', '$filter', 'imagesFactory', 'localStorage', 'coordinatesFactory', '$interval', '$state', 'connectivityMonitor', '$rootScope', function (snackbar, $translate, $q, sqliteFactory, $rootScope, $filter, imagesFactory, localStorage, coordinatesFactory, $interval, $state, connectivityMonitor, $rootScope) {
    var factory = {
        providerList: [],
        saveProviderFile: function () {
            var data = JSON.stringify(factory.providerList);
            var fileName = 'providers.json';

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

                console.log('file system open: ' + fs.name);
                fs.root.getFile("newPersistentFile.txt", {create: true, exclusive: false}, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {

                        fileWriter.onwriteend = function () {
                            console.log("Successful file write...");
                            //readFile(fileEntry);
                        };

                        fileWriter.onerror = function (e) {
                            console.log("Failed file write: " + e.toString());
                        };

                        dataObj = new Blob([data], {type: 'application/json'});


                        fileWriter.write(dataObj);
                    });
                }, function (err) {
                    console.log(err)
                });

            }, function (err) {
                console.log(err)
            });
        },
        getProvidersFromFile: function () {
            var fileName = "providers.json";
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                console.log('file system open: ' + fs.name);
                fs.root.getFile("newPersistentFile.txt", {create: true, exclusive: false}, function (fileEntry) {
                    fileEntry.file(function (file) {
                        var reader = new FileReader();
                        reader.onloadend = function () {
                            factory.setProviders(JSON.parse(this.result));
                            console.log(JSON.parse(this.result));
                            return (JSON.parse(this.result));
                        };
                        reader.readAsText(file);
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    console.log(err)
                });

            }, function (err) {
                console.log(err)
            });
            $rootScope.$broadcast('providerlistLoaded');
        },
        setProviders: function (listProviders) {
            factory.providerList = listProviders;
            if (connectivityMonitor.isOnline()) {
                factory.saveProviderFile();
            }
            $rootScope.$broadcast('providerlistLoaded');

        },
        getProviders: function () {
            var deferred = $q.defer();
            factory.getProvidersImgUrl(factory.providerList).then(function (providersTmp) {
                factory.getProvidersOpenings(providersTmp).then(function (providersTmp2) {
                  if($rootScope.isReady)
                  {
                    factory.getProvidersDistance(providersTmp2).then(function (providersTmp3) {
                        factory.providerList = [];
                        factory.providerList = providersTmp3;
                        deferred.resolve(factory.providerList);

                    }, function () {
                        deferred.resolve(providersTmp2)
                    })
                  }
                }, function () {
                    deferred.resolve(providersTmp);

                })
            }, function () {
                deferred.resolve(factory.providerList);
            })
            return deferred.promise;
        },
        getProviderList: function () {

            factory.getProviders();
        },
        getProvidersImg: function (providers) {
            var deferred = $q.defer();
            var providersTmp = [];
            angular.forEach(providers, function (provider) {
                sqliteFactory.getThumbImage('provider', provider.idprovider).then(function success(file) {
                    provider.file = file;
                    providersTmp.push(provider);
                    if (providersTmp.length === providers.length) {
                        deferred.resolve(providersTmp);
                    }
                });
            });
            return deferred.promise;
        },
        getProvidersImgUrl: function (providers) {
            var deferred = $q.defer();
            var providersTmp = [];
            angular.forEach(providers, function (provider) {
                var file = provider.file;
                if (angular.isDefined(provider.files) && provider.files !== null) {
                    var i = 0;
                    angular.forEach(provider.files, function (file) {
                        imagesFactory.getImages(provider.idprovider, file, 'providers', true).then(function success(imgUrl) {
                            provider.img = imgUrl;
                            i++;
                            if (i == provider.files.length) {
                                providersTmp.push(provider);
                                if (providersTmp.length === providers.length) {
                                    $rootScope.loaderValue = 95;
                                    deferred.resolve(providersTmp);
                                }
                            }
                        });
                    })
                } else {
                    provider.img = 'img/no_pic.png';
                    providersTmp.push(provider);
                    if (providersTmp.length === providers.length) {
                        $rootScope.loaderValue = 45;
                        factory.providerList = [];
                        deferred.resolve(providersTmp);
                    }
                }
            });
            return deferred.promise;
        },

        getProvidersDistance: function (providers) {
            var deferred = $q.defer();
            var providersTmp2 = [];
            coordinatesFactory.isGPSEnabled().then(function (enabled) {
                if (enabled) {
                    coordinatesFactory.getProviderDistance(providers).then(function success(response) {
                        angular.forEach(providers, function (provider, key) {
                            angular.forEach(response, function (provDistance, k) {
                                if (provider.idprovider == provDistance.idprovider) {
                                    provider.distance = provDistance.distance;
                                    provider.value = provDistance.value;
                                }
                            });
                            providersTmp2.push(provider);
                        });
                        $rootScope.loaderValue = 30;
                        deferred.resolve(providersTmp2);
                    }, function (err) {
                        angular.forEach(providers, function (provider, key) {
                            providersTmp2.push(provider);
                        });
                        $rootScope.loaderValue = 30;
                        deferred.resolve(providersTmp2);
                    });
                } else {
                    angular.forEach(providers, function (provider, key) {
                        providersTmp2.push(provider);
                    });
                    $rootScope.loaderValue = 30;
                    deferred.resolve(providersTmp2);
                }
            })
            return deferred.promise;
        },
        getProvidersEvents: function (providers) {
            var deferred = $q.defer();
            var providersEV = [];
            angular.forEach(providers, function (provider) {
                sqliteFactory.getEventByProvider(provider.idprovider).then(function success(result) {
                    var eventTab = [];

                    for (var j = 0; j < result.rows.length; j++) {
                        var soonOrNow = false;
                        var evnt = result.rows.item(j);
                        var event = {
                            idevent: evnt.idevent,
                            name: evnt.name,
                            description: evnt.description,
                            type: evnt.type,
                            start_date: evnt.start_date,
                            end_date: evnt.end_date,
                            place_name: evnt.place_name,
                            address_id: evnt.address_id,
                            provider_id: evnt.provider_id
                        };
                        var today = new Date();
                        var startDate = event.start_date.split(' ');
                        event.start_date = new Date(startDate[0].split('-')[0], startDate[0].split('-')[1] - 1, startDate[0].split('-')[2], startDate[1].split(':')[0], startDate[1].split(':')[1], startDate[1].split(':')[2]);
                        var endDate = event.end_date.split(' ');
                        event.end_date = new Date(endDate[0].split('-')[0], endDate[0].split('-')[1] - 1, endDate[0].split('-')[2], endDate[1].split(':')[0], endDate[1].split(':')[1], endDate[1].split(':')[2]);
                        if (event.start_date.getTime() <= today.getTime() || event.end_date.getTime() >= today.getTime()) {
                            soonOrNow = true;
                            eventTab.push(event);
                        }

                    }
                    provider.events = eventTab;
                    providersEV.push(provider);
                    if (providers.length === providersEV.length) {
                        $rootScope.loaderValue = 50;
                        deferred.resolve(providersEV);
                    }

                }, function error() {
                    providersEV.push(provider);
                    if (providers.length === providersEV.length) {
                        $rootScope.loaderValue = 50;
                        deferred.resolve(providersEV);
                    }
                });

            });
            return deferred.promise;
        },
        getProvidersOpenings: function (providers) {
            var deferred = $q.defer();
            var today = new Date();
            var todayDate = $filter('date')(today, 'yyyy/MM/dd');
            var providersTmp3 = [];
            angular.forEach(providers, function (provider) {
                factory.getIsOpenProvider(provider).then(function success(res) {
                    var opening = res;
                    if (res.noOPInfo === true) {
                        provider.noOPInfo = true;
                    } else {
                        provider.noOPInfo = false;
                        provider.isOpen = opening.isOpen;
                        provider.op = opening.op;
                    }

                    providersTmp3.push(provider);
                    if (providersTmp3.length === providers.length) {
                        $rootScope.loaderValue = 80;
                        deferred.resolve(providersTmp3);
                    }
                }, function error() {
                    $rootScope.loaderValue = 80;
                    deferred.resolve(providers);
                });
            });
            return deferred.promise;
        },
        getProvidersDiscounts: function (providers) {
            var providersFree = [];
            var providersDisc = [];
            var providersAll = [];
            var filter = providers.filter;
            delete providers.filter;
            var deferred = $q.defer();
            angular.forEach(providers, function (provider) {
                provider.discounts = [];
                sqliteFactory.getDiscountByProvider(provider.idprovider).then(function success(res) {
                    var discountsFree = [];
                    var discountsDisc = [];
                    var discountsAll = [];
                    var length = res.rows.length;
                    var isFree;
                    var isReduc;
                    for (var j = 0; j < length; j++) {
                        var discount = res.rows.item(j);
                        var language = appLanguage;
                        switch (language) {
                            case 'fr':
                                discount.description = discount.description_fr;
                                discount.name = discount.name_fr;
                                break;
                            case 'de':
                                discount.description = discount.description_de;
                                discount.name = discount.name_de;
                                break;
                            case 'en':
                                discount.description = discount.description_en;
                                discount.name = discount.name_en;
                                break;
                            default:
                                discount.description = discount.description_fr;
                                discount.name = discount.name_fr;
                                break;
                        }
                        if (discount.price - discount.amount === 0) {
                            discountsFree.push(discount);
                            isFree = true;
                        } else {
                            discountsDisc.push(discount);
                            isReduc = true;
                        }
                        discountsAll.push(discount);
                    }
                    if (filter === 'free' && isFree) {
                        provider.discounts = discountsFree;
                        providersFree.push(provider);
                    } else if (filter === 'reduc' && isReduc) {
                        provider.discounts = discountsDisc;
                        if (discountsDisc.length > 0) {
                            providersDisc.push(provider);
                        }
                    } else if (filter === "") {
                        provider.discounts = discountsAll;
                    }
                    providersAll.push(provider);
                    if (providersAll.length === providers.length) {
                        if (filter === "") {
                            $rootScope.loaderValue = 90;
                            deferred.resolve(providersAll);
                        } else if (filter === 'free') {
                            $rootScope.loaderValue = 90;
                            deferred.resolve(providersFree);
                        } else if (filter === 'reduc') {
                            if (providersDisc.length > 0) {
                                $rootScope.loaderValue = 90;
                                deferred.resolve(providersDisc);
                            } else {
                                snackbar.createSnackbar("Aucun partenaire dans cette catégorie, retour à l'accueil");
                                $state.go('app.home.listpartners', {}, {
                                    reload: true
                                });
                            }
                        }
                    }
                }, function error(err) {
                    console.log('err tools.getDiscounts()' + err);
                    providersFree.push(provider);
                    providersAll.push(provider);

                    if (providersAll.length === providers.length) {
                        if (filter === "") {
                            $rootScope.loaderValue = 90;
                            deferred.resolve(providersAll);
                        } else if (filter === 'free') {
                            $rootScope.loaderValue = 90;
                            deferred.resolve(providersFree);
                        } else if (filter === 'reduc') {
                            if (providersDisc.length > 0) {
                                $rootScope.loaderValue = 90;
                                deferred.resolve(providersDisc);
                            } else {
                                snackbar.createSnackbar($translate.instant("no_providers"));
                                $state.go('app.home.listpartners', {}, {
                                    reload: true
                                });
                            }
                        }
                    }
                });
            });
            return deferred.promise;
        },
        getIsOpenProvider: function (provider) {
            var deferred = $q.defer();
            var providersOP = [];
            var res = provider.openings;
            var opening = {};
            if (angular.isDefined(res) && res !== null) {
                if (res.length > 0) {
                    var isNow;
                    var d = moment();
                    angular.forEach(res, function (event) {
                        switch (event.start.length === 16 ? 'datetime' : (event.start.length === 5 ? 'time' : 'date')) {
                            case 'datetime':
                                //code block
                                var start = moment(event.start.substr(0, 10) + '00:00', 'YYYY-MM-DD HH:mm');
                                var end = moment(event.end.substr(0, 10) + '23:59', 'YYYY-MM-DD HH:mm');
                                break;
                            case 'date':
                                var start = moment(event.start + ' 00:00', 'YYYY-MM-DD HH:mm');
                                var end = moment(event.end + ' 23:59', 'YYYY-MM-DD HH:mm');
                                break;
                            case 'time':
                                var start = moment(d.format('YYYY-MM-DD') + ' 00:00', 'YYYY-MM-DD HH:mm');
                                var end = moment(d.format('YYYY-MM-DD') + ' 23:59', 'YYYY-MM-DD HH:mm');
                                break;
                        }
                        var dowTemp = [];
                        if (angular.isDefined(event.dow) && event.dow !== null) {
                            if (!Array.isArray(event.dow)) {
                                event.dow = event.dow.split(',');
                                if (event.dow !== "") {
                                    angular.forEach(event.dow, function (value, key) {
                                        dowTemp[key] = parseInt(value, 10);
                                    });
                                    event.dow = dowTemp;
                                }
                                if (event.dow.length === 0) {
                                    delete event.dow;
                                }
                            }
                        }
                        if (angular.isDefined(event.nth) && event.nth !== null) {
                            if (!Array.isArray(event.nth)) {
                                event.nth = event.nth.split(',')
                                var nthTemp = [];
                                if (event.nth !== "") {
                                    angular.forEach(event.nth, function (value, key) {
                                        nthTemp[key] = parseInt(value, 10);
                                    });
                                    event.nth = nthTemp;
                                }
                                if (event.nth.length === 0) {
                                    delete event.nth;
                                }
                            }
                        }
                        // compare start/end to date
                        output = ((+(d.toDate()) <= +(end.toDate())) && (+(d.toDate()) >= +(start.toDate())));
                        //output = (d.isSameOrBefore(end) && d.isSameOrAfter(start.format()));
                        if (output && event.dow !== undefined) {
                            // day of the week
                            output = _.indexOf(event.dow, d.day()) != (-1);
                        }
                        if (output && event.nth !== undefined) {
                            // nth day of the month
                            if (event.nth.length > 0)
                                if (_.indexOf(event.nth, Math.ceil(start.date() / 7)) == -1) {
                                    output = false;
                                }
                        }
                        if (output && event.except !== undefined) {
                            // exceptions
                            var exceptExists = false;
                            angular.forEach(event.except, function (except) {
                                if (!exceptExists) {
                                    if (except.type == 'monthly') {
                                        if (moment(except.start).day() == start.day() && Math.ceil(moment(except.start).date() / 7) == Math.ceil(start.date() / 7)) {
                                            output = false;
                                            exceptExists = false;	// break $.each(event.except)
                                        }
                                    } else {
                                        if (start.isBefore(moment(except.end)) && end.isAfter(moment(except.start))) {
                                            output = false;
                                            exceptExists = false;	// break $.each(event.except)
                                        }
                                    }
                                }

                            });
                        }
                        event.title = event.start + " - " + event.end;
                        opening.noOPInfo = false;
                        if (output) {
                            providersOP.push(event.title);
                        } else {
                            opening.isOpen = false;
                        }

                    });
                    var opText;
                    if (providersOP.length > 0) {
                        providersOP.sort();
                        opText = providersOP.join(" / ");
                        opening.isOpen = true;
                        opening.loading = false;
                    }
                    opening.op = opText;
                } else {
                    opening.loading = false;
                    opening.noOPInfo = true;
                }
            } else {
                opening.loading = false;
                opening.noOPInfo = true;
            }
            deferred.resolve(opening);
            return deferred.promise;
        },
        updateProviderDistance: function (providers) {

            var userPosition = localStorage.getObject('userPosition');
            userPosition.latitude = userPosition.latitude.toString();
            userPosition.longitude = userPosition.longitude.toString();
            $interval(function () {
                coordinatesFactory.watchUserPosition().then(function (userPos) {
                    userPos.latitude = userPos.latitude.toString();
                    userPos.longitude = userPos.longitude.toString();
                    if (userPos.latitude.substr(userPos.latitude.indexOf('.'), 4) != userPosition.latitude.substr(userPosition.latitude.indexOf('.'), 4) && userPos.longitude.substr(userPos.longitude.indexOf('.'), 4) != userPosition.longitude.substr(userPosition.longitude.indexOf('.'), 4)) {
                        sqliteFactory.getProviderList().then(function success(res) {
                            if (res.rows.length > 0) {
                                var providers = [];
                                for (var i = res.rows.length - 1; i >= 0; i--) {
                                    var item = res.rows.item(i);
                                    var provider = {
                                        idprovider: item.idprovider,
                                        latitude: item.latitude,
                                        longitude: item.longitude
                                    };
                                    providers.push(provider);
                                }
                                ;
                                coordinatesFactory.getProviderDistance(providers);
                            }
                        });
                    }
                })
            }, 300000)
        }
    };

    return factory;

}]);
