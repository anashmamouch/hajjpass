userpaApp.factory('loginFactory', ['$http', '$q', 'xml2jsonFactory', 'md5', 'sqliteFactory', function($http, $q, xml2jsonFactory, md5, sqliteFactory) {
	var factory = {
			connect : function () {
				var deferred = $q.defer();
				var data = {};
				if (isOnline) {
					sqliteFactory.getUserDevice().then(function success(response) {
						data.userid = response.login;
						data.password = response.password;
						$http.post(prod.serverUrl + prod.urlLogin, data, {params: data}).then(function successCallback(response) {
							var response = xml2jsonFactory.convertData(response.data);
							var status = response.response.st;
							if (status == '200') {
								deferred.resolve(status);
							} else {
								deferred.reject('Wrong credentials');
							}
						}, function errorCallback(response) {
							deferred.reject('Wrong credentials')
						});
					}, function error(response) {
						console.log('getUserDevice error: ' + JSON.stringify(response));
					});
				} else {
					deferred.reject('no_internet');
				}
				return deferred.promise;
			},
			adminConnect : function() {
				var deferred = $q.defer();
				var data = {
						userid : adminLogin,
						password : adminPassword
				};
				if (isOnline) {
					$http.post(prod.serverUrl + prod.urlAdminLogin, data, {params: data}).then(function successCallback(response) {
						var responseAPI = xml2jsonFactory.convertData(response.data);
						var status = responseAPI.response.st;
						if (status == '200') {
							deferred.resolve(status);
						} else {
							deferred.reject(status);
						}
					}, function errorCallback(response) {
						console.log(response.status);
						deferred.reject('Error admin login');
					});
				} else {
					deferred.reject('no_internet');
				}
				return deferred.promise;
			},
			disconnect: function() {
				var deferred = $q.defer();
				if (isOnline) {
					$http.post(prod.serverUrl + prod.urlLogout, {}).then(function success(response) {
						var responseAPI = xml2jsonFactory.convertData(response.data);
						if (responseAPI.response.st == '200') {
							deferred.resolve(responseAPI.response.st);
						}
					}, function error (response) {
						deferred.reject(response.data);
						console.log('disconnectUser error: ' + JSON.stringify(response));
					});
				} else {
					deferred.reject('no_internet');
				}
				return deferred.promise;
			},
			checkUser: function (user, oldPassword) {
				var checked = false;
				if (Object.keys(user).length > 0) {
					var cipheredPwd = user.password;
					var salt = user.salt;
					if (salt !== null) {
                        if (cipheredPwd === (md5.createHash(oldPassword + salt))) {
						    checked = true;
					    }
					}
					else
					{
					    if (cipheredPwd === md5.createHash(oldPassword)) {
					        checked = true;
					    }
					}
					
				}
				return checked;
			},
			loginUser: function(login, password) {
				var deferred = $q.defer();
				var login_ok = false;
				sqliteFactory.getUser().then(function success(user) {
				    if (user.salt) {
				        if (user.login == login && user.password == md5.createHash(md5.createHash(password) + user.salt)) {
				            login_ok = true;
				            deferred.resolve(login_ok);
				        } else {
				            login_ok = false;
				            deferred.reject(login_ok);
				        }
				    }
				    else
				    {
                        if (user.login == login && user.password == md5.createHash(password)) {
						    login_ok = true;
						    deferred.resolve(login_ok);
					    } else {
						    login_ok = false;
						    deferred.reject(login_ok);
					    }
				    }
					
				}, function error(response) {
					deferred.reject(response.data);
					console.log('loginUser error: ' + JSON.stringify(response));
				});
				return deferred.promise;
			},
			getAccount : function(login, password) {
				var pwd = md5.createHash(password);
				var deferred = $q.defer();
				var data = {
						serial: serialNumber,
						login: login,
						password: pwd
				};
				if (isOnline) {
					$http.post(prod.serverUrl + prod.urlGetAccount, data, {params: data}).then(function success(response) {
						var responseAPI = xml2jsonFactory.convertData(response.data);
						var status = responseAPI.response.st;
						if (status == '200') {
							deferred.resolve(responseAPI.response);
						} else {
							deferred.reject(status);
						}
					}, function error(response) {
						deferred.reject(response.data);
						console.log('getAccount error: ' + JSON.stringify(response));
					});
				} else {
					deferred.reject('no_internet');
				}
				return deferred.promise;
			}
	};
	return factory;
}]);
