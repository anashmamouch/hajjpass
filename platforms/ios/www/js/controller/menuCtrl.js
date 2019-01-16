userpaApp.controller('menuCtrl', ['$scope', 'otipass', '$rootScope', 'localStorage', function($scope, otipass, $rootScope, localStorage){
    $scope.openShop = function () {
        window.open('https://www.pass-alsace.com/boutique', '_system');
    }
    $scope.hasOtipass = false;
    $rootScope.$on('actualizeMenu', function () {
        otipass.hasOtipass().then(function (res) {
            if(res === true){
                localStorage.set('numotipassNb', res);

            }
            $scope.hasOtipass = res;
        })
    });
}]);
