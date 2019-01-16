userpaApp.controller('mapProviderCtrl', ['leafletData', 'providerFactory', '$rootScope', '$scope', '$ionicSideMenuDelegate', '$translate', '$compile', function (leafletData, providerFactory, $rootScope, $scope, $ionicSideMenuDelegate, $translate, $compile) {
    var mapGlobal;
    var markerData = [];
    var markerArea = [];

    var initMap = function () {
        var providers = providerFactory.providerList;
        $scope.map = {
            defaults: {
                tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            },
            center: {
                lat: 49.258115,
                lng: 4.031402,
                zoom: 9
            },
            markers:  []
        };
        leafletData.getMap('leafletmap').then(function(map) {
            map.center = {
                lat: 49.258115,
                lng: 4.031402,
                zoom: 9
            };
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);
            var markers = [];
            angular.forEach(providers, function (provider) {
                if(angular.isDefined(provider.latitude) && angular.isDefined(provider.latitude) && provider.latitude != "" && provider.longitude != "" && provider.latitude != null && provider.longitude != null) {
                    var content = '<div id="marker-' + provider.idprovider + '" data-tap-disabled="false"  class="map-provider-infos">';
                    content += '<div class="thumb-container"><img class="thumb" src="' + provider.img + '"></div><div class="map-info"  "><h5>' + provider.name + '</h5><p>';
                    content += provider.address + '<br>';
                    if (angular.isDefined(provider.address2)) {
                        if (provider.address2.length > 0) {
                            content += provider.address2 + '<br>'
                        }
                    }
                    content += provider.postalcode + ' <strong>' + provider.city + '</strong><br>';
                    content += '</p></div></div>';
                    markerData.push([provider.name, provider.latitude, provider.longitude, provider.idprovider, content]);
                }
            });
            var markerDataLength = markerData.length;
            function onClick(e) {
                e.openPopup();
            }
            if (markerDataLength > 0) {
                for (var i = 0; i < markerDataLength; i++) {
                    markerArea.push([markerData[i][1], markerData[i][2]]);
                    markers[i] = L.marker([markerData[i][1], markerData[i][2]]).addTo(map).on('mouseover', onClick);
                    var marker = markers[i];
                    marker.bindPopup(markerData[i][4]);
                }
                if (markerDataLength === 1) {
                    map.setView(markers[0].getLatLng(), 18);
                } else {
                    map.fitBounds(markerArea);
                }
            }
            $scope.map = map;
        });
    };

    var resizeMap = function () {
        mapGlobal.invalidateSize();
        mapGlobal.fitBounds(markerArea);
    };
    $rootScope.$on('$ionicView.enter', function (event, viewData) {
        if (viewData.stateName == 'app.home.mappartners') {
            $ionicSideMenuDelegate.canDragContent(false);
        } else {
            $ionicSideMenuDelegate.canDragContent(true);
        }
    });
    $scope.view = function (idprovider) {
        $state.go('app.partnerdetail', {'id': idprovider});
    };

    /*var filter = "";
    $scope.filter = filter;
    googleMaps.init(filter)*/
    /*var markersArea = [];
    var markers = [];
    for(var i = 0; i < providers.length; i++){
        markersArea.push([providers[i].latitude, providers[i].longitude]);
        markers[i] = L.marker([providers[i].latitude, providers[i].longitude]);
        var marker = markers[i];
        var content = '<div id="marker-' + providers[i].id + '" class="map-provider-infos">';
        content += '<div class="thumb-container"><img class="thumb" src="' + providers[i].img + '"></div><div class="map-info"><h5>' + providers[i].name + '</h5><p>';
        content += providers[i].address + '<br>';
        if(angular.isDefined(providers[i].address2)) {
            if (providers[i].address_2.length > 0) {
                content += providers[i].address_2 + '<br>'
            }
        }
        content += providers[i].postalcode + ' <strong>' + providers[i].city + '</strong><br>';
        content += '<a ui-sref="app.partnerdetail({id : ' + providers[i].id + '})" class="button button-clear button-assertive ripple" transitiontype="fade" direction="left" transition>' +  $translate.instant("explore") + '</a>';
        content += '</p></div></div>';
        marker.bindPopup(content);*/
    /*marker.on('click', function(e){
        e.openPopup();
    })*/


    /*var content = '<div id="marker-' + providers[i].id + '" class="map-provider-infos">';
    content += '<div class="thumb-container"><img class="thumb" src="' + providers[i].img + '"></div><div class="map-info"><h5>' + providers[i].name + '</h5><p>';
    content += providers[i].address + '<br>';
    if(angular.isDefined(providers[i].address2)) {
        if (providers[i].address_2.length > 0) {
            content += providers[i].address_2 + '<br>'
        }
    }
    content += providers[i].postalcode + ' <strong>' + providers[i].city + '</strong><br>';
    content += '<a ui-sref="app.partnerdetail({id : ' + providers[i].id + '})" class="button button-clear button-assertive ripple" transitiontype="fade" direction="left" transition>' +  $translate.instant("explore") + '</a>';
    content += '</p></div></div>';
    var m =  {
        lat: providers[i].latitude,
        lng: providers[i].longitude,
        message: content
    };
    markers.push(m);*/

    /*$scope.data = {};
    $scope.data.markers = markers;
    angular.extend($scope, {
        reims: {

        },
        defaults: {
            // check it
            tileLayer: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            zoomControlPosition: 'topright',
            tileLayerOptions: {
                opacity: 0.9,
                detectRetina: true,
                reuseTiles: true,
            },
            scrollWheelZoom: false
        }
    });*/

    initMap();

    $scope.$on('leafletDirectiveMarker.map.mouseover', function(event, args){
        console.log("CLICK")
    });
    $scope.goProvider = function (idprovider) {
        console.log(idprovider)
    }
}]);
