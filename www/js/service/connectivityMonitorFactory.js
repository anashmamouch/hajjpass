userpaApp.factory('connectivityMonitor', ['$rootScope', '$cordovaNetwork', function($rootScope, $cordovaNetwork) {
	
	var factory = {
			isOnline: function() {
				if (ionic.Platform.isWebView()) {
					return $cordovaNetwork.isOnline();    
				} else {
					return navigator.onLine;
				}
			},
			isOffline: function() {
				if (ionic.Platform.isWebView()) {
					return !$cordovaNetwork.isOnline();    
				} else {
					return !navigator.onLine;
				}
			}
	};
	return factory;
	
}]);