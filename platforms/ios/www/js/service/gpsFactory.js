userpaApp.factory('gpsFactory', ['$q', 'coordinatesFactory', 'providerFactory', '$translate', function($q, coordinatesFactory, providerFactory, $translate) {

	var factory = {
        checkGPS: function() {
        	var deferred = $q.defer();
        	cordova.plugins.diagnostic.getLocationAuthorizationStatus(function (status) {
        		switch (status) {
        			case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
        			case cordova.plugins.diagnostic.permissionStatus.GRANTED:
        			case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
        				console.log("checkGPS - status: " + status);
        				deferred.resolve(factory.isLocationEnabled());
        				break;
        			case cordova.plugins.diagnostic.permissionStatus.DENIED:
        			case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
        			case cordova.plugins.diagnostic.permissionStatus.RESTRICTED:
        				console.log("checkGPS - status: " + status);
        				deferred.resolve(cOK);
        				break;
        		}
        	}, function (error) {
        		deferred.reject("GpsFactory - checkGPS - error: " + JSON.stringify(error));
        	});
        	return deferred.promise;
        },
        isLocationEnabled: function() {
        	var deferred = $q.defer();
        	cordova.plugins.diagnostic.isLocationEnabled(function success(enabled) {
             	if (enabled) {
             		coordinatesFactory.getUserPosition().then(function success(userPosition) {
                 		// update providers distance from user every 5 min if GPS is active and have user consentement
                 		deferred.resolve(cOK);
                 	}, function error(err) {
                 		deferred.resolve(cOK);
                 	});
             	} else {
             		cordova.plugins.locationAccuracy.canRequest(function(canRequest){
         		        cordova.plugins.locationAccuracy.request(function (success){
         		        	console.log("Successfully requested accuracy: "+success.message);
         		        	coordinatesFactory.getUserPosition().then(function success(userPosition) {
                         		// update providers distance from user every 5 min if GPS is active and have user consentement
                         		deferred.resolve(cOK);
                         	}, function error(err) {
                         		deferred.resolve(cOK);
                         	});
         		        }, function (error){
         		        	deferred.resolve(cOK);
         		        	console.log("Accuracy request failed: error code="+error.code+"; error message="+error.message);
         		        	if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED){
         		        		if(window.confirm($translate.instant('failed_gps_activation'))){
         		        			cordova.plugins.diagnostic.switchToLocationSettings();
         		        			deferred.resolve(cOK);
         		        		}
         		        	}
         		        }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
             		}, function (error) {
             			console.log('gpsFactory - canRequest error: ' + JSON.stringify(error));
             			deferred.resolve(cOK);
             		});
             	}
			}, function (error) {
				console.log('gpsFactory - isLocationEnabled error: ' + JSON.stringify(error));
				deferred.resolve(cOK);
			});
        	return deferred.promise;
        }
	}

	return factory;

}]);
