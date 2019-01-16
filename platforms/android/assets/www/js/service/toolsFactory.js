userpaApp.factory('toolsFactory', ['$http', '$q', 'loginFactory', '$rootScope', 'xml2jsonFactory', '$filter', 'sqliteFactory', 'coordinatesFactory', 'imagesFactory', 'localStorage', '$rootScope', function ($http, $q, loginFactory, $rootScope, xml2jsonFactory, $filter, sqliteFactory, coordinatesFactory, imagesFactory, localStorage, $rootScope) {
        var factory = {
            checkLuhn: function (numotipass) {
                var ok = false, vL = 9, vR, num = parseInt(numotipass / 10), i;
                do {
                    vR = num % 100;
                    vL += parseInt(vR / 10);
                    vR %= 10;
                    i = (vR > 4) ? 1 : 0;
                    vL += (vR + vR + i);
                    num /= 100;
                    num = parseInt(num);
                } while (num != 0);
                if (9 - (vL % 10) == (numotipass % 10)) {
                    ok = true;
                }
                return ok;
            },
            getNumOtipassFromSerial: function (numotipass) {
                var deferred = $q.defer();
                var data = {
                    cryptedPass: numotipass
                };
                if (isOnline) {
                    loginFactory.adminConnect().then(function (status) {
                        if (status == "200") {
                            $http.post(prod.serverUrl + prod.urlGetOtipass, data).then(function successCallback(response) {
                                var responseAPI = xml2jsonFactory.convertData(response.data);
                                if (responseAPI.response.st == "200") {
                                    deferred.resolve(responseAPI.response.epass.pass.ot);
                                } else {
                                    deferred.reject('Error pass inexistant');
                                }
                            }, function errorCallback(response) {
                                console.log(response.status);
                                deferred.reject('Error getOtipass');
                            })
                        } else {
                            deferred.reject('Error admin login');
                        }
                    })

                } else {
                    deferred.reject('no_internet');
                }
                return deferred.promise;
            },
            clearDirectory: function () {
                if (ionic.Platform.isAndroid()) {
                    window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, factory.onFileSystemDirSuccess, factory.fail);
                } else {
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, factory.onFileSystemDirSuccess, factory.fail);
                }
            },
            onFileSystemDirSuccess: function (fileSystem) {
                var entry = fileSystem;
                if (ionic.Platform.isAndroid()) {
                    entry = fileSystem;
                    console.log(entry);
                } else {
                    entry = fileSystem.root;
                }
                entry.getDirectory(IMAGE_PATH, {
                        exclusive: false
                    },
                    function (entry) {
                        entry.removeRecursively(function () {
                            console.log("Remove Recursively Succeeded");
                        }, factory.fail);
                        console.log(entry);
                    }, function(error){
                        if(error.code != 1){
                            factory.getDirFail(error);
                        }
                    });
            },
            getDirFail: function (error) {
                console.log(error);
            },

            fail: function (error) {
                console.log(error);
            },
        }
        return factory;
    }]);
