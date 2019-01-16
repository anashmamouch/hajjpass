userpaApp.controller('loadingCtrl', ['$scope', '$rootScope', 'progressBarManager', '$timeout', function ($scope, $rootScope, progressBarManager, $timeout) {
    if (!angular.isDefined($scope.bar2ProgressVal)) {
        $scope.bar2ProgressVal = angular.copy($rootScope.loaderValue);
    }
    $scope.isBar = $rootScope.isBar;
    $scope.bar2 = progressBarManager();
    $scope.loaderMessage = false;
    $scope.$watch('$root.loaderMessage', function () {
        $scope.loaderMessage = $rootScope.loaderMessage;
    })
    $scope.$watch('$root.loaderValue', function () {
        var difference;
        if($rootScope.loaderValue >= 100){
            $scope.bar2ProgressVal = 100;
        }
        else{
            if ($rootScope.isInit === false) {
                difference = $rootScope.loaderValue - $scope.bar2ProgressVal;
            }
            for (var i = 0; i < difference; i++) {
                if($scope.bar2ProgressVal < 100){
                    $timeout(function () {
                        $scope.bar2ProgressVal++;
                    }, 50);
                }
                else{
                    $scope.bar2ProgressVal = 100;
                }
            }
        }
    });
    $scope.$watch('$root.loaderValueInit', function () {
        var difference;
        if($rootScope.loaderValueInit >= 100){
            $scope.bar2ProgressVal = 100;
        }else{
            if ($rootScope.isInit === true) {
                difference = $rootScope.loaderValueInit - $scope.bar2ProgressVal;
            }
            if (difference < 1) {
                $scope.bar2ProgressVal += difference;
            }
            else{
                for (var i = 0; i < difference; i++) {
                    if($scope.bar2ProgressVal < 100){
                        $timeout(function () {
                            $scope.bar2ProgressVal++;
                        }, 50);
                    }
                    else{
                        $scope.bar2ProgressVal = 100;
                    }
                }
            }
        }
        
    });
}]);
userpaApp.filter('limitLoading', function() {
    return function(input){
        if(input > 99){
            return 99;
        }
        else{
            return input;
        }

    }
});
