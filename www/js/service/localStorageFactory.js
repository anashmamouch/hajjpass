userpaApp.factory('localStorage', ['$window', function($window) {
	
	var factory = {
			set: function (key, value) {
				$window.localStorage[key] = value;
			},
			get: function (key) {
				return $window.localStorage[key] || null;
			},
			setObject: function(key, value) {
				$window.localStorage[key] = JSON.stringify(value);
			},
			getObject: function(key) {
				return JSON.parse($window.localStorage[key] || '{}');
			}
	}
	return factory;
	
}]);