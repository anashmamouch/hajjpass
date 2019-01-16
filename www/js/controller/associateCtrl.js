userpaApp.controller('associateCtrl', ['$scope', '$ionicPopup', 'toolsFactory', '$translate', '$state', '$rootScope', '$ionicHistory', 'initFactory', 'snackbar', 'localStorage', 'sqliteFactory', '$ionicLoading', 'otipass', function ($scope, $ionicPopup, toolsFactory, $translate, $state, $rootScope, $ionicHistory, initFactory, snackbar, localStorage, sqliteFactory, $ionicLoading, otipass) {

    $scope.data = {};
    $scope.error = {};
    $scope.loader = false;
    $scope.hasScanned = false;
    var nfcScanned = false;

    if (ionic.Platform.isWebView()) {
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            $ionicLoading.hide();
            snackbar.createSnackbar($translate.instant("no_internet"));
        });
    } else {
        window.addEventListner('offline', function (e) {
            $ionicLoading.hide();
            snackbar.createSnackbar($translate.instant("no_internet"));
        }, false);
    }
    $ionicLoading.hide();

    /* --- QR CODE SCAN --- */
    $scope.scanPassQR = function () {
        cordova.plugins.barcodeScanner.scan(function (result) {
            if(!result.cancelled){
                var numotipass = result.text;
                if (numotipass.length === 8) {
                    if (toolsFactory.checkLuhn(numotipass)) {
                        $scope.data.numotipass = parseInt(numotipass);
                        $rootScope.associate();
                    } else {
                        $scope.loader = false;
                        $scope.error.msg = $translate.instant('numotipass_ko');
                    }
                } else {
                    $scope.loader = false;
                    $scope.error.msg = $translate.instant('numotipass_ko');
                }
            }
        }, function (err) {
            $scope.loader = false;
            $scope.error.msg = $translate.instant('numotipass_ko');
        }, {
            preferFrontCamera: false,
            showFlipCameraButton: true,
            showTorchButton: true,
            torchOn: false,
            saveHistory: false,
            prompt: "Veuillez scanner un pass",
            resultDisplayDuration: 0,
            formats: "QR_CODE,ITF",
            orientation: "portrait",
            disableAnimations: false,
            disableSuccessBeep: false
        });
    }


    /* --- END QR CODE SCAN --- */
    $rootScope.associate = function () {
        if($rootScope.isOnline){
            var numotipass = $scope.data.numotipass;
            if(angular.isDefined(numotipass)){
                $scope.loader = true;
                if(numotipass.toString().length === 8){
                    if(isNumeric(numotipass)){
                        if(toolsFactory.checkLuhn(numotipass)){
                            $scope.error = {};
                            otipass.associatePass(numotipass).then(function (success) {
                                if(numotipass === false){
                                    $scope.loader = false;
                                    snackbar.createSnackbar($translate.instant('no_internet'));
                                } else {
                                    localStorage.set('numotipassNb', numotipass);
                                    $rootScope.$broadcast('actualizeMenu');
                                    $ionicHistory.clearCache().then(function () {
                                        $state.go('app.passdetails');
                                    });
                                }
                            }, function (err) {
                                if(err == 406){
                                    $scope.loader = false;
                                    $scope.error.msg = $translate.instant('presta_device');
                                } else if (err == 412){
                                    $scope.loader = false;
                                    $scope.error.msg = $translate.instant('pass_already_associated');
                                }
                            });
                        } else {
                            $scope.loader = false;
                            $scope.error.msg = $translate.instant('numotipass_ko');
                        }
                    } else {
                        $scope.loader = false;
                        $scope.error.msg = $translate.instant('numotipass_ko');
                    }
                } else {
                    $scope.loader = false;
                    $scope.error.msg = $translate.instant('numotipass_ko');
                }
            } else {
                $scope.error.msg = $translate.instant("data_empty");
            }
        } else {
            $scope.loader = false;
            snackbar.createSnackbar($translate.instant('no_internet'));
        }
    }

    $rootScope.oldassociate = function () {
        if ($rootScope.isOnline == true) {
            var numotipass = $scope.data.numotipass;
            if (numotipass !== undefined) {
                $scope.loader = true;
                if (numotipass.toString().length === 8) {
                    if (isNumeric(numotipass)) {
                        if (toolsFactory.checkLuhn(numotipass)) {
                            $scope.error = {};
                            initFactory.initApp(numotipass).then(function success(response) {

                                if (response === false) {
                                    $scope.loader = false;
                                    $scope.error.msg = $translate.instant('pass_already_associated');
                                } else {
                                    initFactory.initAccount(numotipass).then(function success(response) {
                                        sqliteFactory.getUser().then(function success(response) {
                                            sqliteFactory.getUserEmail().then(function success(res) {
                                                if (res.email.length == 0) {
                                                    localStorage.set('step', 'step3');
                                                } else {
                                                    localStorage.set('isRegister', 'true');
                                                    $rootScope.isRegister = true;
                                                }
                                            });
                                        }, function error(response) {
                                            localStorage.set('step', 'step2');
                                        });
                                        $rootScope.numotipassNb = numotipass;
                                        localStorage.set('numotipassNb', numotipass);
                                        $rootScope.$broadcast('numotipass:change', numotipass);
                                        $rootScope.$broadcast("hceReady");
                                        $ionicHistory.nextViewOptions({
                                            disableAnimate: true,
                                            historyRoot: true
                                        });
                                        $ionicHistory.clearCache().then(function () {
                                            $state.go('app.passdetails');
                                        });
                                    });
                                }
                            });
                        } else {
                            $scope.loader = false;
                            $scope.error.msg = $translate.instant('numotipass_ko');
                        }
                    } else {
                        $scope.loader = false;
                        $scope.error.msg = $translate.instant('numotipass_ko');
                    }
                } else {
                    $scope.loader = false;
                    $scope.error.msg = $translate.instant('numotipass_ko');
                }
            } else {
                $scope.error.msg = $translate.instant("data_empty");
            }
        } else {
            $scope.loader = false;
            snackbar.createSnackbar($translate.instant('no_internet'));
        }
        $rootScope.$broadcast('actualizeMenu');
    }

    function isNumeric(num) {
        return !isNaN(num)
    }

}]);
