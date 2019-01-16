userpaApp.controller('purchaseCtrl', ['$cordovaGlobalization', 'snackbar', '$translate', '$scope', 'connectivityMonitor', '$ionicLoading', '$rootScope', '$ionicBackdrop', function($cordovaGlobalization, snackbar, $translate, $scope, connectivityMonitor, $ionicLoading, $rootScope, $ionicBackdrop) {
	
	$rootScope.$on('$ionicView.beforeEnter', function(event, viewData) {
		if (viewData.stateName == 'app.purchase' && connectivityMonitor.isOnline()) {
			$ionicLoading.show({
				template: $translate.instant("loading"),
				duration: 7000
			});
		}
	});
	
	$cordovaGlobalization.getPreferredLanguage().then(function(result) {
		var locale = (result.value).split('-')[0];
		if (supportedLanguages.indexOf(locale) === -1) {
			locale = 'en';
		}
		if (connectivityMonitor.isOnline()) {
			$scope.src = WEBSHOP_URL + locale + '/';
		} else {
			$ionicLoading.show({
				template: $translate.instant("no_webshop"),
				duration: 5000
			});
		}
	});
	
	$scope.checkIframeLoaded = function() {
		$ionicLoading.hide();
	}
	
	if (ionic.Platform.isWebView()) {
		$rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
			$ionicLoading.hide();
		});
		$rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
			$ionicLoading.show({
				template: $translate.instant("no_webshop"),
				duration: 5000
			});
		});
	} else {
		window.addEventListener('online', function(e) {
			$ionicLoading.hide();
		}, false);
		window.addEventListner('offline', function(e) {
			$ionicLoading.show({
				template: $translate.instant("no_webshop"),
				duration: 5000
			});
		}, false);
	}
    
}]);