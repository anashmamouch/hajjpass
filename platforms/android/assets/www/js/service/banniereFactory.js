userpaApp.factory('banniereFactory', ['$q', 'sqliteFactory', 'imagesFactory', function($q, sqliteFactory, imagesFactory) {
	
	var factory = {
			getCurrentAdvertisement : function() {
				var date = new Date();
				var year = date.getFullYear().toString();
				var month = (date.getMonth()+1).toString();
				var day = date.getDate().toString();				
				var now = year + '-' + (month.length===2?month:'0'+month) + '-' + (day.length===2?day:'0'+day);				
				return factory.getAdvertisements(now)
					.then(factory.getAdsImages)
					.then(factory.getImagesUrl);
			},
			getAdvertisements: function(date) {
				var deferred = $q.defer();
				var advertisements = [];
				sqliteFactory.getAdvertisements(date).then(function success(res) {
					if (angular.isDefined(res.rows)) {
						for (var i = 0; i < res.rows.length; i++) {
							advertisements.push(res.rows.item(i));
						}
						deferred.resolve(advertisements);
					} else {
						deferred.resolve(false);
					}
				}, function error(err) {
					deferred.reject(err);
				});
				return deferred.promise;
			},
			getAdsImages : function(advertisements) {
				var deferred = $q.defer();
				var ads = [];
				var files = [];
				if(advertisements === false){
					deferred.resolve(false);
				}
				else {
                    angular.forEach(advertisements, function (ad, key) {
                        sqliteFactory.getImages('advertisement', ad.idadvertisement).then(function success(response) {
                            ad.files = [];
                            if (angular.isDefined(response.rows)) {
                                for (var i = 0; i < response.rows.length; i++) {
                                    var item = response.rows.item(i);
                                    if (angular.isDefined(item)) {
                                        files.push(item);
                                    }
                                }
                            }
                            ad.files = files;
                            ads.push(ad);
                            deferred.resolve(ads);
                        }, function error(err) {
                            console.log('banniereFactory - getAdsImages err: ' + JSON.stringify(err));
                            deferred.reject(err);
                        });
                    });
                }
				return deferred.promise;
			},
			getImagesUrl: function(advertisements) {
				var deferred = $q.defer();
				var ads = [];
                if(advertisements === false){
                    deferred.resolve(false);
                }
                else {
                    angular.forEach(advertisements, function (ad, key) {
                        var files = ad.files;
                        if (angular.isDefined(files)) {
                            for (var i = 0; i < files.length; i++) {
                                (function (counter) {
                                    imagesFactory.getImages(files[counter].model_id, files[counter].file, 'pages').then(function success(imgUrl) {
                                        files[counter].src = imgUrl;
                                    });
                                })(i);
                            }
                        }
                        deferred.resolve(advertisements);
                    }, function error(err) {
                        console.log('banniereFactory - getImagesUrl err: ' + JSON.stringify(err));
                        deferred.reject(err);
                    });
                }
				return deferred.promise;
			}
	}
	return factory;
	
}]);
