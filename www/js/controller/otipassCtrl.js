userpaApp.controller('otipassCtrl', ['$scope', '$translate', 'mypass', 'sqliteFactory', 'snackbar', '$rootScope', '$ionicLoading', function ($scope, $translate, mypass, sqliteFactory, snackbar, $rootScope, $ionicLoading) {
    $scope.index = 0;
    $scope.qrcode = [];
    $scope.otipass = {};
    $scope.services = "";
    $scope.hidePassValidity = false;
    if (ionic.Platform.isWebView()) {
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            $ionicLoading.hide();
            snackbar.createSnackbar($translate.instant("coupons_internet"));
        });
    } else {
        window.addEventListner('offline', function (e) {
            $ionicLoading.hide();
            snackbar.createSnackbar($translate.instant("coupons_internet"));
        }, false);
    }

    $ionicLoading.show({
        templateUrl: 'templates/loadingTemplate.html'
    });


    $scope.otipassList = mypass;
    $scope.loadPass = function () {
        $scope.otipass = mypass[$scope.index];
        $scope.services = $scope.otipass.services
        if ($scope.otipass.expiry == null) {
            $scope.hidePassValidity = true;
        }
        $scope.numot = $scope.otipass.numotipass.toString()
        $scope.config = {
            name: 'NumOtipass',
            type: 'interleaved2of5',
            text: $scope.numot,
            scale: {x: 3, y: 1},
            options: 'eclevel=M'
        }

        // pass expiry


        // create qrcode
        var div = angular.element(document.querySelector('#qrcode'));


        var div2 = document.getElementById('qrcode');
        div.empty()
        var qrcode = new QRCode(div2, {
            text: $scope.numot,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        $scope.qrcode = qrcode;

        $ionicLoading.hide();
    }

    $scope.loadPass();


    $scope.onTabChange = function (index) {
        $scope.index = index;
        $scope.loadPass();
    }
}]);