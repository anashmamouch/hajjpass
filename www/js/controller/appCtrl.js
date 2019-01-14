userpaApp.controller('appCtrl', ['$scope', 'localStorage', '$ionicModal', '$rootScope', '$state', '$ionicHistory', '$ionicSideMenuDelegate', 'snackbar', '$translate', function($scope, localStorage, $ionicModal, $rootScope, $state, $ionicHistory, $ionicSideMenuDelegate, snackbar, $translate) {

	$scope.logout = function() {
		$rootScope.isLogged = false;
		localStorage.set('isLogged', 'false');
		localStorage.set('rememberMe', 'false');
		$ionicSideMenuDelegate.toggleLeft();
		$ionicHistory.nextViewOptions({
			disableAnimate: true,
			historyRoot: true
		});
		$ionicHistory.clearCache().then(function() {
			$state.go('app.home.listpartners');
		});
		snackbar.createSnackbar($translate.instant("logout_success"));
	}



		$ionicModal.fromTemplateUrl('templates/search.html', {
	            id: 1,
	            scope: $scope,
	            animation: 'slide-in-up'
	        }).then(function (modal) {
	            $rootScope.searchModal = modal;
	        });

	        $scope.$on('$destroy', function () {
	            $rootScope.searchModal.remove();
	        })

	if (devicePlatform === 'android') {
		$scope.platform = 'android';
	}

}]);
