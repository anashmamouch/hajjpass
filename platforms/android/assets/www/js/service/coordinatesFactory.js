userpaApp.factory('coordinatesFactory', ['$http', '$q', '$cordovaGeolocation', 'localStorage', '$rootScope', 'connectivityMonitor', function ($http, $q, $cordovaGeolocation, localStorage, $rootScope, connectivityMonitor) {
	var factory = {
            posOptions: {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 60000
            },
            isGPSEnabled: function()
						{

            	var deferred = $q.defer();
            	if(connectivityMonitor.isOnline) {
                    cordova.plugins.diagnostic.getLocationAuthorizationStatus(function (status) {
                        switch (status) {
                            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                            case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                                console.log("CoordinatesFactory - isGPSEnabled - status: " + status);
                                cordova.plugins.diagnostic.isLocationEnabled(function success(enabled) {
                                    deferred.resolve(enabled);
                                }, function (error) {
                                    deferred.reject("CoordinatesFactory - isGPSEnabled - isLocationEnabled - error: " + JSON.stringify(error));
                                });
                                break;
                            case cordova.plugins.diagnostic.permissionStatus.DENIED:
                            case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                            case cordova.plugins.diagnostic.permissionStatus.RESTRICTED:
                                console.log("CoordinatesFactory - isGPSEnabled - status: " + status);
                                deferred.resolve(false);
                                break;
                        }
                    }, function (error) {
                        deferred.reject("CoordinatesFactory - isGPSEnabled - LocationAuthStatus - error: " + JSON.stringify(error));
                    })
                } else {
            	    deferred.resolve(false);
                }
            	return deferred.promise;

            },
            getCoordinatesWithAddress: function (idprovider, address) {
                var deferred = $q.defer();
                var location = [];
                var error = [];
                $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + GOOGLE_MAP_API_KEY).then(function success(response) {
                    if (response.data.status === 'OK') {
                        location = response.data.results[0].geometry.location;
                        deferred.resolve(location);
                        factory.updateProviderCoordinates(idprovider, location);
                    } else {
                        switch (response.data.status) {
                            case 'ZERO_RESULTS':
                                error.status = 'ZERO_RESULTS';
                                error.message = response.data.error_message;
                                deferred.reject(error);
                                break;
                            case 'OVER_QUERY_LIMIT':
                                error.status = 'OVER_QUERY_LIMIT';
                                error.message = response.data.error_message;
                                deferred.reject(error);
                                break;
                            case 'REQUEST_DENIED':
                                error.status = 'REQUEST_DENIED';
                                error.message = response.data.error_message;
                                deferred.reject(error);
                                break;
                            case 'INVALID_REQUEST':
                                error.status = 'INVALID_REQUEST';
                                error.message = response.data.error_message;
                                deferred.reject(error);
                                break;
                            case 'UNKNOWN_ERROR':
                                error.status = 'UNKNOWN_ERROR';
                                error.message = response.data.error_message;
                                deferred.reject(error);
                                break;
                        }
                    }
                }, function error(response) {
                    deferred.reject(response.data);
                });
                return deferred.promise;
            },
            updateProviderCoordinates: function (idprovider, location) {
                var deferred = $q.defer();
                db.executeSql('UPDATE provider SET latitude = ?, longitude = ? WHERE idprovider = ?', [location.lat, location.lng, idprovider], function (res) {
                    deferred.resolve(res);
                    console.log('updateProviderCoordinates() OK - provider ID: ' + idprovider);
                }, function (err) {
                    deferred.reject(err.message);
                    console.log('updateProviderCoordinates() - error: ' + err.message);
                });
                return deferred.promise;
            },
            getUserPosition: function () {
                var userPos = {};
                var deferred = $q.defer();
                if(devicePlatform == "android"){
                	cordova.plugins.locationServices.geolocation.getCurrentPosition(function success(position) {
	                    userPos.latitude = position.coords.latitude;
	                    userPos.longitude = position.coords.longitude;
	                    deferred.resolve(userPos);
	                }, function (err) {
	                    deferred.reject(err);
	                    console.log('getUserPosition - error: ' + JSON.stringify(err));
	                 },{enableHighAccuracy: false, timeout: 5000});
                } else {
                	$cordovaGeolocation.getCurrentPosition({enableHighAccuracy: false}).then(function (position) {
	                    userPos.latitude = position.coords.latitude;
	                    userPos.longitude = position.coords.longitude;
	                    deferred.resolve(userPos);
	                }, function (err) {
	                    deferred.reject(err);
	                    console.log('getUserPosition - error: ' + JSON.stringify(err));
	                });
                }

                return deferred.promise;
            },
            watchUserPosition: function () {
                var deferred = $q.defer();
                var userPos = {};
                factory.isGPSEnabled().then(function success(enabled) {
                	if (enabled) {
                		if(devicePlatform == "android"){
                			var watch = cordova.plugins.locationServices.geolocation.watchPosition(function success(position){
	                            userPos.latitude = position.coords.latitude;
	                            userPos.longitude = position.coords.longitude;
	                            localStorage.setObject('userPosition', userPos);
	                            deferred.resolve(userPos);
	                        }, function (err) {
	                            deferred.reject(err);
	                            console.log('watchUserPosition- error: ' + JSON.stringify(err));
	                            cordova.plugins.locationServices.geolocation.clearWatch(watch);
	                        },{enableHighAccuracy: true, timeout: 5000});
                		} else {
                			var watch = $cordovaGeolocation.watchPosition({enableHighAccuracy: true});
                			watch.then(null, function (err) {
	                            console.log('watchUserPosition- error: ' + JSON.stringify(err));
	                            watch.clearWatch();
	                            deferred.reject(err);
	                        },function (position) {
	                            userPos.latitude = position.coords.latitude;
	                            userPos.longitude = position.coords.longitude;
	                            localStorage.setObject('userPosition', userPos);
	                            deferred.resolve(userPos);
	                        });
                		}

                	}  else {
                		deferred.reject(cErr);
                	}
                }, function error(err) {
                	deferred.reject(err);
                })
                return deferred.promise;
            },
            getNearProviders: function (providers, idprovider, latitude, longitude) {
                var deferred = $q.defer();
                var distances = [];

                if(angular.isDefined(latitude) && latitude !== null && angular.isDefined(longitude) && longitude !== null) {
                    if (Object.keys(localStorage.getObject('nearProvider_' + idprovider)).length > 0) {
                        deferred.resolve(localStorage.getObject('nearProvider_' + idprovider));
                    } else {
                        for (var i = 0; i < providers.length; i++) {
                            var item = providers[i];
                            if (item.latitude && item.longitude && (item.idprovider != idprovider)) {
                                // distance without formating
                                var value = factory.distance(latitude, longitude, item.latitude, item.longitude);
                                // human readable distance
                                var distance = factory.convertDistance(value);
                                distances.push({
                                    idprovider: item.idprovider,
                                    name: item.name,
                                    city: item.city,
                                    file_name: item.file,
                                    value: value,
                                    distance: distance
                                });
                            }
                        }
                        distances = distances.sort(function (a, b) {
                            return parseFloat(a.value) - parseFloat(b.value);
                        });
                        distances = distances.filter(function (el) {
                            return el.value < nearProviderDistance;
                        })
                        deferred.resolve(distances);
                        localStorage.setObject('nearProvider_' + idprovider, distances);
                    }
                } else {
                    deferred.resolve(distances);
                }
                return deferred.promise;
            },
            getProviderDistance: function (providers) {
            	var deferred = $q.defer();
                var providerDistance = [];
                var userPos = localStorage.getObject('userPosition');
                factory.isGPSEnabled().then(function success(enabled) {
                	if (enabled) {
                		factory.getUserPosition().then(function success(userPosition) {
                			userPos = userPosition;
                            if (userPos) {
                                angular.forEach(providers, function (value, key) {
                                    if (value !== undefined) {
                                        if (value.latitude && value.longitude) {
                                            // distance without formating
                                            distanceValue = factory.distance(userPos.latitude, userPos.longitude, value.latitude, value.longitude);
                                            // human readable distance
                                            humanDistance = factory.convertDistance(distanceValue);
                                            providerDistance.push({
                                                idprovider: value.idprovider,
                                                distance: humanDistance,
                                                value: distanceValue
                                            });
                                        }
                                    }
                                });
                                localStorage.setObject('providerDistance', providerDistance);
                                $rootScope.$broadcast('provider:distance', providerDistance);
                                deferred.resolve(providerDistance);
                            } else {
                                deferred.resolve(cOK);
                            }
                		}, function err(){
                            deferred.resolve(cOK);
                        });
                    } else {
                        deferred.resolve(cOK);
                    }
                })

                return deferred.promise;
            },
            convertRad: function(input) {
            	return (Math.PI * input) / 180;
            },
            distance: function (latA, lngA, latB, lngB) {
            	R = 6378000 // Rayon de la Terre en m
            	latA = factory.convertRad(latA);
            	lngA = factory.convertRad(lngA);
            	latB = factory.convertRad(latB);
            	lngB = factory.convertRad(lngB);
            	return R * (Math.PI/2 - Math.asin( Math.sin(latB) * Math.sin(latA) + Math.cos(lngB - lngA) * Math.cos(latB) * Math.cos(latA)));
            },
            convertDistance: function (value) {
				value = parseFloat(value, 10);
				var d;
				if (Math.floor(value).toString().length < 2) {
					if (Math.floor(value) == 0) {
						d = 0 + 'm';
					} else {
						d = Number(value).toFixed(1) + 'm';
					}
				} else if (Math.floor(value).toString().length < 4) {
					d = Number(value).toFixed() + 'm';
				} else {
					if (Number(value/1000).toFixed(1) % 1 == 0 || Number(value/1000) > 100) {
						d = Number(value/1000).toFixed() + 'km';
					} else {
						d = Number(value/1000).toFixed(1) + 'km';
					}
				}
				return d;
            }
        };
        return factory;
    }]);
