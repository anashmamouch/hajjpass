userpaApp.controller('personCtrl', ['$scope', 'sqliteFactory', '$state', '$http', '$translate', '$cordovaGlobalization', 'camera', 'localStorage', 'loginFactory', '$ionicLoading', 'snackbar', '$rootScope', function($scope, sqliteFactory, $state, $http, $translate, $cordovaGlobalization, camera, localStorage, loginFactory, $ionicLoading, snackbar, $rootScope) {
	
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
	$scope.data = {};
	$cordovaGlobalization.getPreferredLanguage().then(function(result) {
		var webshopLocales = ['fr', 'en', 'de'];
		var locale = (result.value).split('-')[0];
		if (webshopLocales.indexOf(locale) === -1) {
			locale = 'fr';
		}
		$http.get('js/resources/country_' + locale + '.json').then(function success(response) {
			$scope.countries = response.data;
		});
	});
	sqliteFactory.getPersonWithAddress().then(function success(res) {
		try {
			if (res.rows.length > 0) {
				var data = res.rows.item(0);
				if (data.birthdate !== null && data.birthdate !== undefined) {
						if (devicePlatform == 'ios') {
							data.birthdate = data.birthdate.replace(/-/g, '/');
						}
						var birthdate = new Date(data.birthdate);
						data.birthdate = birthdate;
				}
				$scope.data = data;
				if (localStorage.get('userImg')) {
					$scope.data.srcImg = localStorage.get('userImg');
					console.log($scope.data.srcImg);
				}
			} else {
				sqliteFactory.getNumotipass().then(function success(res) {
					$scope.data.numotipass = res.rows.item(0);
				});
			}
			if ($scope.data.country_code_id.length == 0) {
				$scope.data.country_code_id = 'FR';
			}
			if (localStorage.get('numotipassNb') != null) {
				$scope.data.numotipass = localStorage.get('numotipassNb');
			}
		} catch(e) {
			$scope.data.title = 'M.';
			$scope.data.country_code_id = 'FR';
			console.log(e);
		}
	},
	function error(err) {
		console.log('personCtrl - getPerson() - err: ' + err);
	});
	
	$scope.processHolder = function() {
		if (isOnline) {
			$ionicLoading.show({
				templateUrl: 'templates/loadingTemplate.html'
			});
			var birthdate = null;
			if ($scope.data.birthdate !== null && $scope.data.birthdate !== undefined) {
				var year = $scope.data.birthdate.getFullYear().toString();
				var month = ($scope.data.birthdate.getMonth()+1).toString();
				var day = $scope.data.birthdate.getDate().toString();
				birthdate = year + '-' + (month.length===2?month:'0'+month) + '-' + (day.length===2?day:'0'+day);			
			}
			var address = {
					request: {
						header: {
							sn: serialNumber
						},
						haddress: {
							address: $scope.data.address,
							address2: $scope.data.address_2,
							postalcode: $scope.data.postalcode,
							city: $scope.data.city,
							countryCodeId: $scope.data.country_code_id,
							telephone: $scope.data.telephone,
							email: $scope.data.email
						}
					}
			};
			if (typeof $scope.data.idaddress != undefined) {
				address.request.haddress.id = $scope.data.idaddress;
			}
			var person = {
					request: {
						header: {
							sn: serialNumber
						},
						person: {
							title: $scope.data.title,
							lastName: $scope.data.lastname,
							firstName: $scope.data.firstname,
							language: $scope.data.language,
							birthDate: birthdate,
							userId: $scope.data.user_id
						}
					}
			};
			if (typeof $scope.data.idperson == undefined && $scope.data.numotipass.length > 0) {
				person.request.header.ot = $scope.data.numotipass;
			} else {
				person.request.person.id = $scope.data.idperson;
			}
			
			loginFactory.connect().then(function success(response) {
				sqliteFactory.setAddress(address).then(function success(response) {
					var idaddress = response.id;
					if (idaddress == $scope.data.idaddress) {
						sqliteFactory.updateAddress(address.request.haddress);
					} else {
						address.request.haddress.id = idaddress;
						sqliteFactory.insertAddress(address.request.haddress);
					}
					person.request.person.addressId = idaddress;
					sqliteFactory.setPerson(person).then(function success(response) {
						$ionicLoading.hide();
						snackbar.createSnackbar($translate.instant(response.msg));
						if (response.id == $scope.data.idperson) {
							sqliteFactory.updatePerson(person.request.person);
						} else {
							person.request.person.id = response.id;
							sqliteFactory.insertPerson(person.request.person);
						}
						loginFactory.disconnect();
					}, function error(err) {
						$ionicLoading.hide();
						snackbar.createSnackbar($translate.instant(err.msg));
					});			
				}, function error(err) {
					console.log('personCtrl - setAddress error: ' + JSON.stringify(err));
				});
			}, function(error) {
				$ionicLoading.hide();
				snackbar.createSnackbar($translate.instant("need_internet"));
			});
		} else {
			snackbar.createSnackbar($translate.instant("need_internet"));
		}
	}
	$scope.takePicture = function() {
		camera.getPicture().then(function success(result) {
			imgPath = result + '?cb=' + Math.round(Math.random() * 999999);
			$scope.data.srcImg = imgPath;
			localStorage.set('userImg', imgPath);
			$state.reload();
			snackbar.createSnackbar($translate.instant("reload_app"));
		}, function error(response) {
			console.log(response);
		});
	} 
	
	
}]);
