userpaApp.controller('providerDetailCtrl', ['$sce', '$q', 'gpsEnabled', '$compile', '$scope', '$filter', 'sqliteFactory', '$stateParams', 'imagesFactory', 'localStorage', '$cordovaSocialSharing', 'coordinatesFactory', '$cordovaInAppBrowser', 'snackbar', '$rootScope', '$translate', '$state', '$ionicLoading', 'moment', '_', '$ionicModal', 'providerDetail', function ($sce, $q, gpsEnabled, $compile, $scope, $filter, sqliteFactory, $stateParams, imagesFactory, localStorage, $cordovaSocialSharing, coordinatesFactory, $cordovaInAppBrowser, snackbar, $rootScope, $translate, $state, $ionicLoading, moment, _, $ionicModal, providerDetail) {

    if (ionic.Platform.isWebView()) {
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            $ionicLoading.hide();
            snackbar.createSnackbar($translate.instant("no_internet"));
        });
    } else {
        window.addEventListener('offline', function (e) {
            $ionicLoading.hide();
            snackbar.createSnackbar($translate.instant("no_internet"));
        }, false);
    }
    if (angular.isDefined(providerDetail.openings) && providerDetail.openings && providerDetail.openings !== "") {
        $scope.hasOpening = true;
    } else {
        $scope.hasOpening = false;
    }
    $scope.deliberatelyTrustDangerousSnippet = function () {
        return $sce.trustAsHtml($scope.provider.long_description);
    };
    $scope.tidy = function (input) {
        var e = document.createElement('div');
        e.innerHTML = input;
        // handle case of empty input
        return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }
    console.log(providerDetail);
    switch (appLanguage) {
        case 'fr':
            if (providerDetail.description_fr !== null) {
                if (providerDetail.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_fr);
                } else {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_fr);
                }
                providerDetail.long_description = $sce.trustAsHtml($scope.tidy(providerDetail.long_description_fr));
            }
            break;
        case 'en':
            if (providerDetail.description_en !== null && angular.isDefined(providerDetail.description_en)) {
                if (providerDetail.description_en.match(/(<([^>]+)>)/ig) !== null) {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_en);
                } else {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_en.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                }
                providerDetail.long_description = $sce.trustAsHtml($scope.tidy(providerDetail.long_description_en));
            }
            else if (providerDetail.description_fr !== null) {
                if (providerDetail.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_fr);
                } else {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_fr.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                }
                providerDetail.long_description = $sce.trustAsHtml($scope.tidy(providerDetail.long_description_fr));
            }
            break;
        default:
            if (providerDetail.description_en !== null && angular.isDefined(providerDetail.description_en)) {

                if (providerDetail.description_en.match(/(<([^>]+)>)/ig) !== null) {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_en);
                } else {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_en.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                }
                providerDetail.long_description = $sce.trustAsHtml($scope.tidy(providerDetail.long_description_en));
            } else if (providerDetail.description_fr !== null) {
                if (providerDetail.description_fr.match(/(<([^>]+)>)/ig) !== null) {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_fr);
                } else {
                    providerDetail.description = $sce.trustAsHtml(providerDetail.description_fr.replace(/(?:\r\n|\r|\n)/g, '<br>'));
                }
                providerDetail.long_description = $sce.trustAsHtml($scope.tidy(providerDetail.long_description_fr));
            }
            break;
    }
    $scope.nearP = false;
    $scope.address2 = false;
    $scope.website = false;
    $scope.carousel = false;
    $scope.gpsEnabled = gpsEnabled;
    $scope.innerWidth = window.innerWidth;

    $scope.provider = providerDetail;

    if (providerDetail.nearProviders.length > 0) {
        $scope.nearP = true;
        $scope.nearProviders = providerDetail.nearProviders;
    }

    $scope.updatePage = function (num) {
        $scope.currentPage = num;
    }
    if (angular.isDefined(providerDetail.address_2) && providerDetail.address_2 !== null) {
        if (providerDetail.address_2.length > 0) {
            $scope.address2 = true;
        }
    }
    if (angular.isDefined(providerDetail.website) && providerDetail.website !== null) {

        if (providerDetail.website.length > 0) {
            $scope.website = true;
        }
    }
    $scope.currentPage = 0;
    $scope.selectedOpening = 0;

    // Swiper (carousel) options
    $scope.options = {
        effect: 'slide',
        speed: 500,
        autoHeight: true,
        pagination: false
    };

    if (angular.isDefined(providerDetail.files)) {
        $scope.carousel = true;
        if (providerDetail.files.length > 1) {
            $scope.options.loop = true;
            $scope.options.pagination = '.swiper-pagination';
            $scope.options.autoplay = 5000;
            $scope.options.autoplayDisableOnInteraction = false;
        }
    } else {

    }

    window.addEventListener('resize', function (event) {
        $scope.$apply(function () {
            return $scope.innerWidth = window.innerWidth;
        })
    }, false);

    $scope.$watch('innerWidth', function (width) {
        if (width < 597) {
            $scope.pageSize = 1;
        } else if (width >= 598 && width < 767) {
            $scope.pageSize = 2;
        } else if (width >= 768 && width < 1023) {
            $scope.pageSize = 3;
        } else {
            $scope.pageSize = 4;
        }
    });


    $scope.uiConfig = {};

    $scope.split = function(string, nb) {
        var array = string.split(',');
        return array[nb];
    }

    $scope.extraEventSignature = function (event) {
        return "" + event;
    }
    var getEvents = function (start, end) {
        var deferred = $q.defer();
        angular.forEach($scope.provider.openings, function(event){
            var dowTemp = [];
            if(angular.isDefined(event.dow)){
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
            if(angular.isDefined(event.nth)){
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
            if (event.start.length > 10) {
                event.title = event.start.substring(10) + " - " + event.end.substring(10);

            } else {
                event.title = event.start + " - " + event.end;
            }
        });
        deferred.resolve($scope.provider.openings);
        return deferred.promise;
    }

    $scope.uiConfig = {
        calendar: {
            editable: false,
            locale: appLanguage,
            lang: appLanguage,
            height: "auto",
            allDaySlot: false,
            defaultView: 'agendaWeek',
            minTime: "08:00:00",
            maxTime: "20:00:00",
            slotDuration: "00:30",
            displayEventTime: false,
            eventColor: "#03a9f4",
            header: {
                left: 'month agendaWeek agendaDay',
                center: 'title',
                right: 'prev,next'
            },
            eventRender: function (event, element, view) {
                var output = false;
                if (event.nth !== undefined && event.nth !== undefined) {
                    if (event.nth.length > 0)
                        if (_.indexOf(event.nth, Math.ceil(event.start.date() / 7)) === -1) {
                            return false;
                        }
                }
                if (event.except !== undefined) {
                    var output = true;
                    angular.forEach(event.except, function (except, k) {
                        if (except.type === 'monthly') {
                            if (moment(except.start).day() === event.start.day() && Math.ceil(moment(except.start).date() / 7) === Math.ceil(event.start.date() / 7)) {
                                output = false;
                                return false;
                            }
                        } else {
                            if (event.start.isBefore(moment(except.end)) && event.end.isAfter(moment(except.start))) {
                                output = false;
                                return false;
                            }
                        }
                    });
                    return output;
                }
            },
            events: function (start, end, timezone, callback) {
                getEvents(start, end).then(function success(res){
                    callback(res);
                })
            }

        }
    };


    if (devicePlatform == 'android') {
        $scope.mapUrl = 'geo:0,0?q=' + $scope.provider.address + '+' + $scope.provider.postalcode + '+' + $scope.provider.city + '+' + $scope.provider.country_code_id + '';
    } else {
        $scope.mapUrl = 'http://maps.apple.com/?q=' + $scope.provider.address + '+' + $scope.provider.postalcode + '+' + $scope.provider.city + '+' + $scope.provider.country_code_id + '&ll=' + $scope.provider.latitude + ',' + $scope.provider.longitude + '';
    }
    $scope.share = function () {

        if (devicePlatform == 'ios') {
            var name = $scope.provider.name;
            var website = $scope.provider.website;
            var options = {
                subject: name,
                url: website,
                message: name
            }
            window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
            var onSuccess = function (result) {
                console.log(result);
            }
            var onError = function (err) {
                console.log(err);
            }
        }

        else if (devicePlatform == 'android') {
            $cordovaSocialSharing.share(null, $scope.provider.name, null, $scope.provider.website).then(function (result) {
            }, function (err) {
            });
        }

    }
    $ionicLoading.hide();


    $scope.openWebsite = function () {
        cordova.InAppBrowser.open('http://' + $scope.provider.website, '_system');
    }

    $scope.view = function (idprovider) {
        $state.go('app.partnerdetail', {'id': idprovider});
    }
    $scope.goEvents = function (idprovider) {
        $scope.eventModal.show();
        //$state.go('app.eventsdetail', { 'id': idprovider });
    }
    $ionicModal.fromTemplateUrl('templates/eventsDetail.html', {
        id: 2,
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.eventModal = modal;
    });
    $scope.$on('$destroy', function () {
        $scope.eventModal.remove();
    });
    $scope.plusArrow = function () {
        if ($scope.openings[$scope.selectedOpening + 1] != undefined) {
            $scope.selectedOpening++;
        }
    }
    $scope.minusArrow = function () {
        if ($scope.openings[$scope.selectedOpening - 1] != undefined) {
            $scope.selectedOpening--;
        }
    }
    $scope.Compare = function (a, b) {
        if (a[0] < b[0])
            return -1;
        if (a[0] > b[0])
            return 1;
        return 0;
    }

}]);
