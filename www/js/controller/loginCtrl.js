userpaApp.controller('loginCtrl', ['$scope', '$state', 'loginFactory', '$translate', '$rootScope', '$ionicHistory', 'localStorage', 'md5', 'snackbar', '$ionicLoading', function($scope, $state, loginFactory, $translate, $rootScope, $ionicHistory, localStorage, md5, snackbar, $ionicLoading) {
	
	$scope.data = {};
		
	if (ionic.Platform.isWebView()) {
		$rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
			$ionicLoading.hide();
			snackbar.createSnackbar($translate.instant("no_internet"));
		});
	} else {
		window.addEventListner('offline', function(e) {
			$ionicLoading.hide();
			snackbar.createSnackbar($translate.instant("no_internet"));
		}, false);
	}

	$scope.login = function() {
		
		var data = $scope.data;
		
		loginFactory.loginUser(data.username, data.password).then(function success(response) {
			$rootScope.isLogged = true;
			localStorage.set('isLogged', 'true');
			if (data.rememberme) {
				localStorage.set('rememberMe', 'true');
			}
			$ionicHistory.nextViewOptions({
				disableAnimate: true,
				historyRoot: true
			});
			$ionicHistory.clearCache().then(function() {
				$state.go('app.home.listpartners');
			});
			snackbar.createSnackbar($translate.instant("login_success"));
		}, function error(response) {
			snackbar.createSnackbar($translate.instant("login_failed") + ' ' + $translate.instant("check_credentials"));
		});
	}
	
	$scope.changeInputType = function(inputId) {
		var input = document.getElementById(inputId); 
		var type = input.getAttribute('type');
		if (type === 'password') {
			input.setAttribute('type', 'text');
		} else {
			input.setAttribute('type', 'password');
		}
	}
	
}]);