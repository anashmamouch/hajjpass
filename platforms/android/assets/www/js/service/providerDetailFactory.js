userpaApp.factory('providerDetailFactory', ['$q', 'sqliteFactory', 'coordinatesFactory', 'providerFactory', 'imagesFactory', function ($q, sqliteFactory, coordinatesFactory, providerFactory, imagesFactory) {

    var factory = {
        selectedProvider: {},
        getProviderDetail: function (idprovider) {
            return factory.getProviderById(idprovider)
                .then(factory.getProviderImg)
                .then(factory.getProviderImgUrl)
                .then(factory.getNearProviders);
        },
        getSelectedProvider: function () {
            var deferred = $q.defer();
            if(factory.selectedProvider != {}){
                factory.getNearProviders(factory.selectedProvider).then(function success(providerTmp){
                    factory.getProviderImgUrl(providerTmp).then(function (provider) {
                        deferred.resolve(provider);
                    }, function error(err) {
                        deferred.reject(err);
                    })
                }, function error(err) {
                    deferred.reject(err);
                })
            } else {
                deferred.reject("no provider Selected");
            }
            return deferred.promise;
        },
        getProviderById: function (idprovider) {
            var deferred = $q.defer();
            sqliteFactory.getProviderById(idprovider).then(function success(res) {
                var provider = res;
                switch (appLanguage) {
                    case 'fr':
                        if (provider.description_fr !== null) {
                            if (provider.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = provider.description_fr;
                            } else {
                                provider.description = provider.description_fr.replace(/(?:\r\n|\r|\n)/g, '<br>');
                            }
                            provider.long_description = provider.long_description_fr;
                        }
                        break;
                    case 'en':
                        if (provider.description_en !== null) {
                            if (provider.description_en.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = provider.description_en;
                            } else {
                                provider.description = provider.description_en.replace(/(?:\r\n|\r|\n)/g, '<br>');
                            }
                            provider.long_description = provider.long_description_en;
                        }
                        else if (provider.description_fr !== null) {
                            if (provider.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = provider.description_fr;
                            } else {
                                provider.description = provider.description_fr.replace(/(?:\r\n|\r|\n)/g, '<br>');
                            }
                            provider.long_description = provider.long_description_fr;
                        }
                        break;
                    default:
                        if (provider.description_en !== null) {

                            if (provider.description_en.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = provider.description_en;
                            } else {
                                provider.description = provider.description_en.replace(/(?:\r\n|\r|\n)/g, '<br>');
                            }
                            provider.long_description = provider.long_description_en;
                        } else if (provider.description_fr !== null) {
                            if (provider.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                                provider.description = provider.description_fr;
                            } else {
                                provider.description = provider.description_fr.replace(/(?:\r\n|\r|\n)/g, '<br>');
                            }
                            provider.long_description = provider.long_description_fr;
                        }
                        break;
                }
                deferred.resolve(provider);
            }, function error(err) {
                deferred.reject(err);
                console.log('getProviderById - error: ' + err.message);
            });
            return deferred.promise;
        },
        getProviderImg: function (provider) {
            var deferred = $q.defer();
            sqliteFactory.getImages('provider', provider.idprovider).then(function success(res) {
                if (angular.isDefined(res.rows)) {
                    provider.files = [];
                    for (var i = 0; i < res.rows.length; i++) {
                        var item = res.rows.item(i);
                        provider.files.push(item);
                    }
                    deferred.resolve(provider);
                }
            });
            return deferred.promise;
        },
        getProviderImgUrl: function (provider) {
            var deferred = $q.defer();
            if (angular.isDefined(provider.files) && provider.files.length > 0) {
                var files = provider.files;
                angular.forEach(files, function (v, k) {
                    imagesFactory.getImages(provider.idprovider, v.file, 'provider', true).then(function success(imageUrl) {
                        v.src = imageUrl;
                    });
                });
                deferred.resolve(provider);
            } else {
                deferred.resolve(provider);
            }
            return deferred.promise;
        },
        getNearProviders: function (provider) {
            var deferred = $q.defer();
            provider.nearProviders = [];
            coordinatesFactory.getNearProviders(providerFactory.providerList, provider.idprovider, provider.latitude, provider.longitude).then(function success(distance) {
                if (angular.isDefined(distance) && distance.length > 0) {
                    angular.forEach(distance, function (value, key) {
                        imagesFactory.getImages(value.idprovider, value.file_name, 'provider', true).then(function success(imageUrl) {
                            value.img = imageUrl;
                        });
                        provider.nearProviders.push(value);
                        deferred.resolve(provider);
                    })
                } else {
                    deferred.resolve(provider);
                }
            }, function (err) {
                console.log(err.message);
                deferred.resolve(provider);
            });
            return deferred.promise;
        },
        getProviderEvents: function (provider) {
            var deferred = $q.defer();
            sqliteFactory.getEventByProvider(provider.idprovider).then(function success(result) {
                var eventTab = [];
                var eventTabPast = [];
                for (var j = 0; j < result.rows.length; j++) {
                    var evnt = result.rows.item(j);
                    if (evnt.id_address == null) {
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
                        if (event.start_date.getTime() >= today.getTime() || event.end_date.getTime() >= today.getTime()) {
                            soonOrNow = true;
                            eventTab.push(event);
                        } else {
                            soonOrNow = false;
                            eventTabPast.push(event);
                        }
                    } else {
                        sqliteFactory.getAddressById(evnt.id_address).then(function success(res) {
                            evnt.address = res.address;
                            var event = {
                                idevent: evnt.idevent,
                                name: evnt.name,
                                description: evnt.description,
                                type: evnt.type,
                                start_date: evnt.start_date,
                                end_date: evnt.end_date,
                                place_name: evnt.place_name,
                                address_id: evnt.address_id,
                                provider_id: evnt.provider_id,
                                address: evnt.address
                            };
                            eventTab.push(event);
                        })
                    }
                }
                provider.events = eventTab;
                deferred.resolve(provider);
            }, function error(err) {
                deferred.resolve(provider);
            });
            return deferred.promise;
        }
    }
    return factory;

}]);
