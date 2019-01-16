userpaApp.controller('createaccountCtrl', ['$scope', '$translate', 'md5', 'sqliteFactory', 'toolsFactory', 'initFactory', 'loginFactory', 'localStorage', '$ionicHistory', '$state', '$rootScope', '$ionicSideMenuDelegate', 'snackbar', '$ionicLoading',
	function($scope, $translate, md5, sqliteFactory, toolsFactory, initFactory, loginFactory, localStorage, $ionicHistory, $state, $rootScope, $ionicSideMenuDelegate, snackbar, $ionicLoading) {
	
	$scope.account = {};
	$scope.loginData = {};
	$scope.createData = {};
	$scope.emailData = {};
	$scope.loader = false;
	$scope.noEmail = false;
	$scope.create = false;
	$scope.hideStep2 = false;
	$scope.hideStep2b = true;
	$scope.disableStep = false;
	$scope.activeStep = 'step1a';
	$scope.error = {};
	$scope.step = {};
	$scope.msg = {};
	$scope.associated = false;
	$scope.numotipass = localStorage.get('numotipassNb');
	
	$rootScope.$on('$ionicView.enter', function() {
		$ionicSideMenuDelegate.canDragContent(false);
	});
	
	$rootScope.$on('$ionicView.beforeEnter', function(event, viewData) {
		if (viewData.stateName === 'app.createaccount') {
			if (localStorage.get('step') !== null) {
				var step = localStorage.get('step');
				switch(step) {
					case 'step2':
						$scope.step.oneA = 'completed';
						$scope.step.oneB = 'completed';
						$scope.activeStep = 'step2';
						$scope.associated = true;
						$scope.create = true;
					break;
					case 'step3':
						$scope.step.oneA = 'completed';
						$scope.step.oneB = 'completed';
						$scope.step.two = "completed";
						$scope.activeStep = 'step3';
					break;
				}
			}
		}
	});
	
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
	
		
	// step 1a
	$scope.checkNumotipass = function() {
		if (isOnline) {
			$scope.msg.step1a = true;
			$scope.loader = true;
			var data = $scope.account;
			if (data.numotipass != undefined) {
				if (!toolsFactory.checkLuhn(data.numotipass)) {
					$scope.loader = false; 
					$scope.error.numotipass = $translate.instant('numotipass_ko');
				} else {
					$scope.numotipass = data.numotipass;
					$rootScope.numotipassNb = data.numotipass;
					localStorage.set('numotipassNb', data.numotipass);
					$rootScope.$broadcast('numotipass:change', data.numotipass);
					// User exists
					initFactory.initApp(data.numotipass).then(function success(response) {
						initFactory.initAccount(data.numotipass).then(function success(response) {
							sqliteFactory.getUser().then(function success(reponse) {
								// Un utilisateur est associé à ce pass
								sqliteFactory.getUserEmail().then(function success(res) {
									$scope.step.oneA = 'completed';
									$scope.step.oneB = 'completed';
									$scope.disableStep = true;
									$scope.msg.step1a = false;
									$scope.loader = false;
									if (res.email.length == 0) {
										$scope.step.two = "completed";
										$scope.activeStep = 'step3';
										// l'utilisateur n'a pas d'email => on l'envoie à la step 3
										$scope.noEmail = true;
									} else {
										$scope.step.two = 'completed';
										$scope.step.three = 'competed';
										// l'utilisateur possède un compte complet => Procédure de création de compte complétée
										$rootScope.isRegister = true;
										localStorage.set('isRegister', 'true');
										$rootScope.numotipassNb = data.numotipass;
										snackbar.createSnackbar($translate.instant("account_created"));
										// redirection sur la home page
										$ionicHistory.nextViewOptions({
											disableAnimate: true,
											historyRoot: true
										});
										$ionicHistory.clearCache().then(function() {
											$state.go('app.home.listpartners');
										});
									}
								});
							}, function error(response) {
								// Pas d'utilisateur associé à ce pass => on l'envoie à la step 2
								$scope.step.oneA = 'completed';
								$scope.step.oneB = 'completed';
								$scope.activeStep = 'step2';
								$scope.disableStep = true;
								$scope.loader = false;
								$scope.msg.step1a = false;
								$scope.create = true;
							});
						});
					});
				}
			} else {
				$scope.msg.step1a = false;
				$scope.loader = false;
				$scope.error.numotipass = $translate.instant("data_empty");
			}
		} else {
			snackbar.createSnackbar($translate.instant("no_internet"));
		}
	}
	
	// step 1b
	$scope.login = function() {
		if (isOnline) {
			$scope.error.login = false;
			if ($scope.loginData.login != undefined && $scope.loginData.password != undefined) {
				$scope.msg.step1b = true;
				$scope.loader = true;
				loginFactory.connect().then(function success(response) {
					loginFactory.getAccount($scope.loginData.login, $scope.loginData.password).then(function success(result) {
						$scope.disableStep = true;
						// le compte existe
						if ($scope.loginData.rememberme) {
							// sauvegarde des identitfiants en local
							$rootScope.isLogged = true;
							localStorage.set('isLogged', 'true');
							localStorage.set('rememberMe', 'true');
						}
						if (result.epass == undefined) {
							// pas de numotipass associé
							$scope.step.oneA = 'completed';
							$scope.step.oneB = 'completed';
							$scope.msg.step1 = false;
							$scope.loader = false;
							$scope.activeStep = 'step2b';
						} else {
						    var numotipass;
						    if (result.epass.pass[0] !== undefined) {
						        numotipass = result.epass.pass[0].ot;
						    }
						    else
						    {
						        numotipass = result.epass.pass.ot;
						    }
							// update device
							initFactory.initApp(numotipass).then(function success(response) {
								initFactory.initAccount(numotipass).then(function success(response) {
									sqliteFactory.getUserEmail().then(function success(res) {
										$scope.step.oneA = 'completed';
										$scope.step.oneB = 'completed';
										$scope.step.twoB = 'completed';
										$scope.hideStep2 = true;
										$scope.msg.step1b = false;
										$scope.loader = false;
										if (res === undefined){
										    $scope.activeStep = 'step3';
										    // l'utilisateur n'a pas d'email => on l'envoie à la step 3
										    $scope.noEmail = true;
										    
										} else {
											$scope.step.three = 'competed';
											$scope.existingNumotipass = true;
											// l'utilisateur possède un compte complet => Procédure de création de compte complétée
											$rootScope.isRegister = true;
											localStorage.set('isRegister', true);
											$rootScope.numotipassNb = numotipass;
											localStorage.set('numotipassNb', numotipass);
											// redirection sur la home page
											$ionicHistory.nextViewOptions({
												disableAnimate: true,
												historyRoot: true
											});
											$ionicHistory.clearCache().then(function() {
												$state.go('app.home.listpartners');
											});
										}
									})
								});
							});
						}
					}, function error(response) {
						// le compte n'est pas trouvé - erreur identifiant ou compte inexistant
						$scope.msg.step1b = false;
						$scope.loader = false;
						$scope.error.login = true; 
						$scope.error.msg = $translate.instant("login_failed");
						$scope.error.msg2 = $translate.instant("check_credentials");
					});
				});
			}			
		} else {
			snackbar.createSnackbar($translate.instant("no_internet"));
		}
	}
	
	// step 2
	$scope.createAccount = function () {
		if (isOnline) {
			$scope.error.pwd = false;
			var data = $scope.createData;
			if (data.login != undefined && data.password != undefined && data.confPassword != undefined) {
				if (data.password == data.confPassword) {
					if (data.rememberme) {
						$rootScope.isLogged = true;
						localStorage.set('isLogged', 'true');
						localStorage.set('rememberMe', 'true');
					}
					var user = {
							request: {
								header: {
									sn: serialNumber,
									ot: $scope.numotipass
								},
								user: {
									login: data.login,
									password: md5.createHash(data.password),
									salt: null,
									profile: USR_PROFILE
								}
							}
					};
					loginFactory.connect().then(function success(response) {
						sqliteFactory.setUser(user).then(function success(response) {
							var iduser = response.id;
							user.request.user.iduser = iduser;
							sqliteFactory.insertUser(user.request.user);
							loginFactory.disconnect();
							$scope.step.oneA = 'completed';
							$scope.step.oneB = 'completed';
							$scope.step.twoB = 'completed';
							$scope.step.two = 'completed';
							$scope.activeStep = 'step3';
							$rootScope.isRegister = true;
							localStorage.set('isRegister', true);
							$scope.noEmail = true;
						}, function error(response) {
							$scope.error.pwd = true;
							$scope.error.msg = $translate.instant(response.msg);
						});
					});
				} else {
					$scope.error.confPwd = true; 
					$scope.error.msg = $translate.instant("no_match_password");
				}
			} else {
				$scope.error.pwd = true;
				$scope.error.msg = $translate.instant("data_empty");
			}
		} else {
			snackbar.createSnackbar($translate.instant("no_internet"));
		}
	}
	
	// step 3
	$scope.addEmail = function() {
		if (isOnline) {
		    if ($scope.emailData.email != undefined) {
		        if ($scope.emailData.name != undefined) {
		            if ($scope.emailData.name != undefined) {

		                var iduser = '';
		                var numotipass = '';
		                var idperson = '';
		                var address = {
		                    request: {
		                        header: {
		                            sn: serialNumber
		                        },
		                        haddress: {
		                            address: null,
		                            address2: null,
		                            postalcode: null,
		                            city: null,
		                            countryCodeId: 'FR',
		                            telephone: null,
		                            email: $scope.emailData.email
		                        }
		                    }
		                };
		                var person = {
		                    request: {
		                        header: {
		                            sn: serialNumber,
		                        },
		                        person: {
		                            title: null,
		                            lastname: $scope.emailData.name,
		                            firstname: $scope.emailData.firstName,
		                            language: 'fr',
		                            birthDate: null,
		                        }
		                    }
		                };
		                if ($scope.emailData.newsletter) {
		                    person.request.person.acceptoffers = 1;
		                }
		                else
		                {
		                    person.request.person.acceptoffers = 0;
		                }
		                sqliteFactory.getUser().then(function success(user) {
		                    iduser = user.iduser;
		                    person.request.person.userId = iduser;
		                    sqliteFactory.getNumotipass().then(function success(response) {
		                        numotipass = response.rows.item(0).numotipass;
		                        person.request.header.ot = numotipass;
		                        loginFactory.connect().then(function success(response) {
		                            sqliteFactory.setAddress(address).then(function success(response) {
		                                var idaddress = response.id;
		                                address.request.haddress.idaddress = idaddress;
		                                sqliteFactory.insertAddress(address.request.haddress);
		                                person.request.person.addressId = idaddress;
		                                sqliteFactory.setPerson(person).then(function success(response) {
		                                    idperson = response.id;
		                                    person.request.person.id = idperson;
		                                    sqliteFactory.insertPerson(person.request.person);
		                                    loginFactory.disconnect();
		                                    $rootScope.isRegister = true; 
		                                    localStorage.set('isRegister', 'true');
		                                    localStorage.set('isLogged', 'true');
		                                    localStorage.set('name', person.request.person.firstname);
		                                    localStorage.set('lastName', person.request.person.lastname);
		                                    $rootScope.$broadcast('hceReady');
		                                    $rootScope.numotipassNb = numotipass;
		                                    localStorage.set('numotipassNb', numotipass);
		                                    $ionicHistory.nextViewOptions({
		                                        disableAnimate: true,
		                                        historyRoot: true
		                                    });
		                                    $ionicHistory.clearCache().then(function () {
		                                        $state.go('app.home.listpartners');
		                                    });
		                                }, function error(response) {
		                                    $scope.error.email = $translate.instant(response.msg);
		                                });
		                            }, function error(response) {
		                                $scope.error.email = $translate.instant(response.msg);
		                            });
		                        }, function (error) {
		                            snackbar.createSnackbar($translate.instant(error));
		                        });
		                    });
		                });
		            } else {
		                $scope.error.msg = true;
		                $scope.error.emptyFirstName = $translate.instant("data_empty");
		            }
		        } else {
		            $scope.error.msg = true;
		            $scope.error.emptyName = $translate.instant("data_empty");
		        }
				
			} else { 
				$scope.error.msg = true;
				$scope.error.emptyEmail = $translate.instant("data_empty");
			}
		} else {
			snackbar.createSnackbar($translate.instant("no_internet"));
		}
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
	
	$scope.returnToHome = function() {
		$ionicHistory.nextViewOptions({
		     disableAnimate: true,
		     disableBack: true,
		     historyRoot: true
		});
		$ionicHistory.clearCache().then(function() {
			$ionicHistory.clearHistory();
			$state.go('app.home.listpartners');
		});
	}
		
}]);
