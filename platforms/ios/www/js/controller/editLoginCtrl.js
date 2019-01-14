userpaApp.controller('editLoginCtrl', ['$scope', 'loginFactory', 'sqliteFactory', 'md5', '$translate', '$rootScope', 'snackbar', '$ionicLoading', '$ionicHistory', '$state', function($scope, loginFactory, sqliteFactory, md5, $translate, $rootScope, snackbar, $ionicLoading, $ionicHistory, $state) {
	
	$scope.data = {};
	$scope.user = {};
	$scope.error = {};
		
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

	sqliteFactory.getUser().then(function success(response) {
		$scope.user = response;
	});
	
	$rootScope.editLogin = function() {
		var login_ok = loginFactory.checkUser($scope.user, $scope.data.oldPass);
		if (login_ok) {
			if ($scope.data.newPass === $scope.data.confNewPass) {
				var user = {
						request: {
							header: {
								sn: serialNumber
							},
							user: {
								id: $scope.user.iduser,
								login: $scope.user.login,
								password: md5.createHash($scope.data.newPass),
								salt: $scope.user.salt,
								profile: $scope.user.profile
							}
						}
				};
				loginFactory.connect().then(function success(response) {
					sqliteFactory.setUser(user).then(function success(response) {
						snackbar.createSnackbar($translate.instant(response.msg));
						sqliteFactory.updateUserPassword(response.id, md5.createHash($scope.data.newPass));
						$scope.data = {};
						loginFactory.disconnect();
						$ionicHistory.nextViewOptions({
						    disableAnimate: true,
						    historyRoot: true
						});
						$ionicHistory.clearCache().then(function () {
						    $state.go('app.home.listpartners');
						});
					}, function error(response) {
						snackbar.createSnackbar($translate.instant(response.msg));
					});					
				})
			} else {
				$scope.error.conf = $translate.instant('no_match_password');
			}
		} else {
			$scope.error.old = $translate.instant('bad_password');
		}
	};
	
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