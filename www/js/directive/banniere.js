userpaApp.directive('banniere', ['banniereFactory', '$compile', '$ionicSlideBoxDelegate', function(banniereFactory, $compile, $ionicSlideBoxDelegate) {
	
	return {
		restrict: 'E',
		scope: {},
		link: function(scope, elem, attrs) {
			scope.openLink = function(url, id, content) {
				if (url.length > 0) {
                    window.FirebasePlugin.logEvent("banner_click" + id, {content_type: content, item_id: id}, function success(){
                        console.log("submitted event");
                        cordova.InAppBrowser.open(url, '_system');
                    }, function error(err){
                        console.log(err);
                        cordova.InAppBrowser.open(url, '_system');
                    });
				}
			}
			banniereFactory.getCurrentAdvertisement().then(function success(res) {
				if (res.length > 0) {
					angular.forEach(res, function (ad, k) {
						if ((ad.start_date !== null && Date.parse(ad.start_date) < Date.now()) || ad.start_date == null) {
							navigator.globalization.getPreferredLanguage(function (language) {
								var language = (language.value).split("-")[0];
								angular.forEach(ad.files, function(file, k) {
									switch (language) {
										case 'fr':
											file.content = file.content_fr;
											break;
                                        case 'en':
                                            if(file.content_en) { file.content = file.content_en; }
                                            else{file.content = file.content_fr;}
                                            break;
                                        case 'de':
                                            if(file.content_de) { file.content = file.content_de; }
                                            else if(file.content_en){file.content = file.content_en;}
                                            else{file.content = file.content_fr;}
                                            break;

                                        default:
										    if(file.content_en) { file.content = file.content_en; }
										    else{file.content = file.content_fr;}
										break;
									}
								});
							});
							scope.slides = ad.files;
							scope.options = {
									loop: true,
									effect: 'slide',
									speed: 500,
									autoplay: 5000,
									autoplayDisableOnInteraction: false,
							};
							if(scope.slides.length == 1){
								scope.options.loop = false;
							}
							var html = 
								'<ion-slides id="banniere" class="banniere-container" options="options">\
									<ion-slide-page ng-repeat="slide in slides">\
										<figure class="banniere" ng-click="openLink(\'{{slide.url}}\', \'{{slide.model_id}}\', \'{{slide.content}}\')">\
											<img ng-src="{{slide.src}}">\
											<figcaption ng-if="slide.content" ng-bind-html="slide.content"></figcaption>\
										</figure>\
									</ion-slide-page>\
								</ion-slides>';
							html = angular.element(html);
							elem.append(html);
							$compile(html)(scope);
						}
					});
				}
			}, function error(err) {
				console.log(JSON.stringify(err));
			})
		}
	}
	
}]);

