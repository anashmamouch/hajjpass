userpaApp.factory('camera', ['$cordovaCamera', '$cordovaFile', '$q', function($cordovaCamera, $cordovaFile, $q) {
	var factory = {
			options : { 
	            quality : 10, 
	            destinationType : Camera.DestinationType.FILE_URI, 
	            sourceType : Camera.PictureSourceType.CAMERA, 
	            allowEdit : false,
	            encodingType: Camera.EncodingType.JPEG,
	            targetWidth: 1024,
	            targetHeight: 1024,
	            saveToPhotoAlbum: true,
	            cameraDirection: Camera.Direction.FRONT
	        },
	        movePicture : function(fileUri){
	        	 var newPath = storageDir + IMAGE_PATH;
	        	 var newFile = profilePicture;
	        	 $cordovaFile.removeFile(newPath, newFile);
	        	 var name = fileUri.substr(fileUri.lastIndexOf('/') + 1);
	        	 var oldPath = fileUri.substr(0, fileUri.lastIndexOf('/') + 1);
	        	 $cordovaFile.moveFile(oldPath, name, newPath, newFile);
	        	 var newPic = newPath + newFile;
	        	 var deferred = $q.defer();
	        	 deferred.resolve(newPic);
	        	 return deferred.promise;
	        },
	        getPicture: function() {
	        	if (device.platform === 'iOS') {
	        		factory.options.destinationType = Camera.DestinationType.FILE_URI;
	        		factory.options.popoverOptions = CameraPopoverOptions;
	        	}
	        	var deferred = $q.defer();
	        	$cordovaCamera.getPicture(factory.options).then(function(imageData){
	        			factory.movePicture(imageData).then(function(newPic){
	        				deferred.resolve(newPic);	
	        			});
	        	}, function(error) {
	        		deferred.reject(error);
	        	});
	        	return deferred.promise;
	        },
	}   
	return factory;
	
}]);
