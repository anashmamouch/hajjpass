userpaApp.factory('googleMaps', ['markers', '$compile', 'localStorage', 'snackbar', '$q', '$rootScope', '$translate', 'coordinatesFactory', '$ionicLoading', 'connectivityMonitor', 'providerFactory', function (markers, $compile, localStorage, snackbar, $q, $rootScope, $translate, coordinatesFactory, $ionicLoading, connectivityMonitor, providerFactory) {

    var factory = {
        map: null,
        markerData: [],
        markerDataCache: [],
        infoWindow: new google.maps.InfoWindow(),
        userMarker: null,
        userArea: new google.maps.LatLngBounds(),
        markerArea: new google.maps.LatLngBounds(),
        markerCluster: null,
        markers: [],
        initMap: function (filter) {
            factory.markerArea = new google.maps.LatLngBounds();
            factory.markerData = [];
            factory.markerDataCache = [];
            factory.markerCluster = null;
            var latLng = new google.maps.LatLng(0, 0);
            var mapOptions = {
                center: latLng,
                zoom: 8,
                disableDefaultUI: true,
            };
            factory.map = null;
            if(document.getElementById("map_" + filter)){
                factory.map = new google.maps.Map(document.getElementById("map_" + filter), mapOptions);
                google.maps.event.addListenerOnce(factory.map, 'idle', function () {
                    factory.markers = [];
                    factory.loadMarkers(filter);
                    factory.enableMap();

                });

                $rootScope.$on('$ionicView.enter', function (event, viewData) {
                    if ((viewData.stateName == 'app.reduc.mappartnersreduc' || viewData.stateName == 'app.home.mappartners' ||  viewData.stateName == 'app.free.mappartnersfree') && factory.map != null) {
                        google.maps.event.trigger(factory.map, 'resize');
                    }
                });
            }

        },
        loadMarkers: function (filter) {
            providerFactory.getProviders().then(function (markers) {
                // providers Markers
                angular.forEach(markers, function (provider) {
                    var content = '<div id="marker-' + provider.idprovider + '" class="map-provider-infos">';
                    content += '<div class="thumb-container"><img class="thumb" src="' + provider.img + '"></div><div class="map-info"><h5>' + provider.name + '</h5><p>';
                    content += provider.address + '<br>';
                    if(provider.address_2 !== null) {
                        if (provider.address_2.length > 0) {
                            content += provider.address_2 + '<br>'
                        }
                    }
                    content += provider.postalcode + ' <strong>' + provider.city + '</strong><br>';
                    content += '<a ui-sref="app.partnerdetail({id : ' + provider.idprovider + '})" class="button button-clear button-assertive ripple" transitiontype="fade" direction="left" transition>' + $translate.instant("explore") + '</a>';
                    content += '</p></div></div>';
                    var compiledContent = $compile(content)($rootScope);
                    // hack to prevent multiple add of same marker in map
                    if (!factory.markerDataExists(provider.idprovider)) {
                        factory.markerData.push([provider.name, provider.latitude, provider.longitude, provider.idprovider, compiledContent[0]]);
                    }
                    var cache = {id: provider.idprovider};
                    factory.markerDataCache.push(cache);
                });
                factory.addMarkersToMap(factory.markerData);
                factory.addDeZoomControl();

                coordinatesFactory.isGPSEnabled().then(function success(enabled) {
                    if (enabled) {
                        factory.addUserLocalization();
                    }
                })
            });

        },
        markerDataExists: function (providerId) {
            var exists = false;
            var cache = factory.markerDataCache;
            for (var i = 0; i < cache.length; i++) {
                if (cache[i].id === providerId) {
                    exists = true;
                }
            }
            return exists;
        },
        addMarkersToMap: function (markerData) {
            var markers = factory.markers;
            factory.markerCluster = new MarkerClusterer(factory.map, [], {imagePath: 'img/m'});
            if (markers.length > 0) {
                markers = [];
            }
            for (var i = 0; i < markerData.length; i++) {
                markers.push(new google.maps.Marker({
                    position: new google.maps.LatLng(markerData[i][1], markerData[i][2]),
                    title: markerData[i][0],
                    map: factory.map
                }));
                var marker = markers[i];

                factory.markerCluster.addMarker(marker);
                factory.markerArea.extend(marker.getPosition());
                factory.map.fitBounds(factory.markerArea);

                factory.addInfoWindows(marker, markerData[i]);
            }
            google.maps.event.addListener(factory.map, 'click', function () {
                factory.infoWindow.close();
            });
        },
        addInfoWindows: function (marker, markerData) {
            google.maps.event.addListener(marker, 'click', (function (marker) {
                return function () {
                    factory.infoWindow.setContent(markerData[4]);
                    factory.infoWindow.open(factory.map, marker);
                }
            })(marker));
        },
        addUserLocalization: function () {
            if(document.getElementById("centerControl") ||factory.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].length == 2){return false;}
            factory.getUserPosition(factory.userMarker, factory.userArea, factory.map);
            // center to user position
            var centerControlDiv = document.createElement('div');
            var centerControl = new factory.centerControl(centerControlDiv, factory.map);
            centerControlDiv.index = 1;
            factory.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
        },
        centerControl: function (controlDiv, map) {
            var controlUI = document.createElement('div');
            controlUI.className = 'infoWindow';
            controlUI.setAttribute("id", "centerControl");
            controlUI.style.textAlign = 'center';
            controlUI.style.backgroundColor = '#fff';
            controlUI.style.boxShadow = '0 2px 4px rgba(0,0,0, 0.45)';
            controlUI.style.width = '50px';
            controlUI.style.height = '50px';
            controlUI.style.lineHeight = '35px';
            controlUI.style.padding = '10px';
            controlUI.style.marginRight = '25px';
            controlUI.style.marginBottom = '25px';
            controlUI.style.borderRadius = '50%';
            controlUI.style.fontSize = '3em';
            controlDiv.appendChild(controlUI);
            var controlText = document.createElement('div');
            controlText.innerHTML = '<i class="icon ion-android-locate"></i>';
            controlUI.appendChild(controlText);
            controlUI.addEventListener('click', function () {
                map.fitBounds(factory.userArea);
                map.setZoom(15);
            });
        },
        addDeZoomControl: function () {
            if(document.getElementById("zoomControl") || factory.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].length == 2){return false;}
            var zoomControlDiv = document.createElement('div');
            var zoomControl = new factory.zoomControl(zoomControlDiv, factory.map);
            zoomControlDiv.index = 1;
            factory.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);
        },
        zoomControl: function (controlDiv, map) {
            var controlUI = document.createElement('div');
            controlUI.className = 'infoWindow';
            controlUI.setAttribute("id", "zoomControl");
            controlUI.style.textAlign = 'center';
            controlUI.style.backgroundColor = '#fff';
            controlUI.style.boxShadow = '0 2px 4px rgba(0,0,0, 0.45)';
            controlUI.style.width = '50px';
            controlUI.style.height = '50px';
            controlUI.style.lineHeight = '35px';
            controlUI.style.padding = '10px';
            controlUI.style.marginRight = '25px';
            controlUI.style.marginBottom = '25px';
            controlUI.style.marginTop = '25px';
            controlUI.style.borderRadius = '50%';
            controlUI.style.fontSize = '3em';
            controlDiv.appendChild(controlUI);
            var controlText = document.createElement('div');
            controlText.innerHTML = '<i class="icon ion-arrow-expand"></i>';
            controlUI.appendChild(controlText);
            controlUI.addEventListener('click', function () {
                map.fitBounds(factory.markerArea);
            });
        },
        getUserPosition: function (userMarker, userArea, map) {
            localStorage.set('coordsOK', true);
            coordinatesFactory.getUserPosition().then(function success(userPosition) {
                userMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(userPosition.latitude, userPosition.longitude),
                    map: map,
                    icon: 'img/pa-locate.svg'
                });
                userArea.extend(userMarker.getPosition());
            }, function error(response) {
                console.log('mapProviderCtrl - userPosition error: ' + JSON.stringify(response));
            });
        },
        enableMap: function () {
            $ionicLoading.hide();
            google.maps.event.trigger(factory.map, 'resize');
        },
        disableMap: function () {
            $ionicLoading.show({
                template: $translate.instant("maps_internet"),
                duration: 5000
            });
        },
        loadGoogleMaps: function () {
            $ionicLoading.show({
                template: $translate.instant("loading_maps"),
                duration: 5000
            });
            window.mapInit = function () {
                factory.initMap();
            }
        },
        checkLoaded: function () {
            if (typeof google == 'undefined' || typeof google.maps == 'undefined') {
                factory.loadGoogleMaps();
            } else {
                factory.enableMap();
            }
        },
        addConnectivityListener: function () {
            if (ionic.Platform.isWebView()) {
                // check if the map is already loaded when the user comes online, if not loaded
                $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                    factory.checkLoaded();
                });
                // Disable the map when the user goes offline
                $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                    factory.disableMap();
                });
            } else {
                window.addEventListener('online', function (e) {
                    factory.checkLoaded();
                }, false);
                window.addEventListner('offline', function (e) {
                    factory.disableMap();
                }, false);
            }
        },
        init: function (filter) {
            if (typeof google == 'undefined' || typeof google.maps == 'undefined') {
                console.log('Google Maps SDK must to be loaded');
                factory.disableMap();
                if (connectivityMonitor.isOnline()) {
                    factory.loadGoogleMaps();
                }
            } else {
                if (connectivityMonitor.isOnline()) {
                    factory.initMap(filter);
                    factory.enableMap();
                } else {
                    factory.disableMap()
                }
            }
            factory.addConnectivityListener();
        }

    };
    return factory;

}]);
