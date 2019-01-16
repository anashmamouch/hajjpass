userpaApp.factory('imagesFactory', ['$cordovaFile', '$cordovaFileTransfer', '$q', '$http', '$rootScope', function ($cordovaFile, $cordovaFileTransfer, $q, $http, $rootScope) {
    var factory = {
        getImages: function (model_id, file, model, thumb) {
            var deferred = $q.defer();
            var file_name = "";
            if (file !== null && angular.isDefined(file)) {
                if(angular.isDefined(file.file) && file.file !== null){
                    file_name = file.file;
                } else {
                    file_name = file;
                }

                if (angular.isDefined(file_name) && file_name != null) {
                    var filename = file_name.split(".");
                    var path = storageDir + IMAGE_PATH;
                    var file = filename[0];
                    if (thumb) {
                        path += 'thumbs/' + model_id + '/';
                        file += thumbDimension;
                    }
                    $cordovaFile.checkFile(path, file + '.jpg').then(function (success) {
                        deferred.resolve(success.nativeURL);
                    }, function (error) {
                        if (error.code == 1) {
                            factory.downloadImages(model_id, file_name, model, thumb).then(function success() {
                                $cordovaFile.checkFile(path, file + '.jpg').then(function (success) {
                                    deferred.resolve(success.nativeURL);
                                }, function (error) {
                                    if (error.code == 1) {
                                        deferred.resolve('img/no_pic.png');
                                    }
                                });
                            })
                        } else {
                            deferred.reject(error.code);
                            console.log('imagesFactory - checkFile error: ' + error.code);
                        }
                    });
                } else {
                    deferred.resolve('img/no_pic.png');
                }
            } else {
                deferred.resolve('img/no_pic.png');
            }
            return deferred.promise;
        },
        removeImage: function (model_id, file_name, thumb) {
            var filename = file_name.split(".");
            var deferred = $q.defer();
            var path = storageDir + IMAGE_PATH;
            var file = filename[0];
            if (thumb) {
                path += 'thumbs/';
                file += thumbDimension;
            }
            $cordovaFile.removeFile(path, file + '.jpg').then(function (success) {
                deferred.resolve(success);
                console.log("Deleted " + path + file + thumbDimension);
            }, function (err) {
                console.log("err with file " + path + file + thumbDimension);
            });
            return deferred.promise;
        },
        createDir: function () {
            var deferred = $q.defer();
            $cordovaFile.createDir(storageDir, 'Pictures', true).then(function (success) {
                $cordovaFile.createDir(storageDir, IMAGE_PATH, true).then(function (success) {
                    $cordovaFile.createDir(storageDir, IMAGE_PATH + "thumbs/", true).then(function (success) {
                        deferred.resolve(cOK);
                    })
                }, function (error) {
                    deferred.reject(JSON.stringify(error));
                    console.log('CreateDir ' + IMAGE_PATH + ' err: ' + error.code);
                })
            }, function (error) {
                deferred.reject(JSON.stringify(error));
                console.log('CreateDir Pictures err: ' + error.code);
            });
            return deferred.promise;
        },
        resizeImage: function (url, callback) {
            var longSideMax = 150;
            var tempImg = new Image();
            tempImg.src = url;
            tempImg.onload = function () {
                // Get image size and aspect ratio.
                var targetWidth = 300;
                var targetHeight = tempImg.height;
                var aspect = tempImg.width / tempImg.height;

                // Calculate shorter side length, keeping aspect ratio on image.
                // If source image size is less than given longSideMax, then it need to be
                // considered instead.
                if (tempImg.width > tempImg.height) {
                    longSideMax = Math.min(tempImg.width, longSideMax);
                    targetWidth = longSideMax;
                    targetHeight = longSideMax / aspect;
                }
                else {
                    longSideMax = Math.min(tempImg.height, longSideMax);
                    targetHeight = longSideMax;
                    targetWidth = longSideMax * aspect;
                }

                // Create canvas of required size.
                var canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                var ctx = canvas.getContext("2d");
                // Take image from top left corner to bottom right corner and draw the image
                // on canvas to completely fill into.
                ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, targetWidth, targetHeight);

                callback(canvas.toDataURL("image/jpeg"));
            };
        },
        getFileContentAsBase64: function (path, callback) {
            window.resolveLocalFileSystemURL(path, gotFile, fail);

            function fail(e) {
                alert('Cannot found requested file');
            }

            function gotFile(fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function (e) {
                        var content = this.result;
                        callback(content);
                    };
                    // The most important point, use the readAsDatURL Method from the file plugin
                    reader.readAsDataURL(file);
                });
            }
        },
        syncImages: function (model_id, file_name, model, thumb) {
            var url = prod.imgServerUrl + model + '/';
            var fileName = file_name.split(".");
            if (thumb) {
                url += 'thumbs/';
            }
            url += model_id + '/' + fileName[0];
            if (thumb) {
                url += thumbDimension
            }
            url += '.jpg';
            var targetPath = storageDir + IMAGE_PATH;
            var targetFile = fileName[0] + ".jpg";

            $cordovaFile.checkFile(targetPath, targetFile).then(function success() {

            }, function error() {
                return $http.get(url).then(function success(response) {
                    if (response.status == 200 && response.headers('Content-Type') === 'image/jpeg') {
                        var targetPath = storageDir + IMAGE_PATH + fileName[0] + ".jpg";
                        var thumbTargetPath = storageDir + IMAGE_PATH + "thumbs/" + model_id + '/' + fileName[0] + thumbDimension + ".jpg";
                        $cordovaFileTransfer.download(url, thumb ? thumbTargetPath : targetPath, {headers: {'Content-Type': 'image/jpeg'}}, true).then(function (result) {
                            console.log('DownloadImg: ' + fileName[0] + '.jpg');
                            $rootScope.loaderValueInit += +($rootScope.percentageToAdd);
                        }, function (error) {
                            console.log('DownloadImgThumb error: ' + JSON.stringify(error));
                        })
                    }
                }, function error(response) {
                    console.log('GetDownloadImg error: ' + JSON.stringify(response));
                });
            })
        },
        downloadImages: function (model_id, file_name, model, thumb) {
            var deferred = $q.defer();
            var url = prod.imgServerUrl + model + '/';
            var fileName = file_name.split(".");
            if (thumb) {
                url += 'thumbs/';
            }
            url += model_id + '/' + fileName[0];
            if (thumb) {
                url += thumbDimension
            }
            url += '.jpg';

            return $http.get(url).then(function success(response) {
                if (response.status == 200 && response.headers('Content-Type') === 'image/jpeg') {
                    var targetPath = storageDir + IMAGE_PATH + fileName[0] + ".jpg";
                    var thumbTargetPath = storageDir + IMAGE_PATH + "thumbs/" + model_id + '/' + fileName[0] + thumbDimension + ".jpg";
                    $cordovaFileTransfer.download(url, thumb ? thumbTargetPath : targetPath, {headers: {'Content-Type': 'image/jpeg'}}, true).then(function (result) {
                        deferred.resolve(cOK);
                        console.log('DownloadImg: ' + fileName[0] + '.jpg');
                        $rootScope.loaderValueInit += +($rootScope.percentageToAdd);
                    }, function (error) {
                        deferred.reject(error);
                        console.log('DownloadImgThumb error: ' + JSON.stringify(error));
                    })
                }
            }, function error(response) {
                deferred.reject(error);
                console.log('GetDownloadImg error: ' + JSON.stringify(response));
            });
            return deferred.promise;
        },
        downloadProvidersMapImg: function (idprovider, latitude, longitude) {
            var googleMapUrl = 'https://maps.googleapis.com/maps/api/staticmap?key=' + GOOGLE_MAP_API_KEY + '&center=' + latitude + ',' + longitude + '&zoom=14&size=640x400&scale=2&format=jpg&';
            googleMapUrl += encodeURI('markers=color:red|' + latitude + ',' + longitude);
            var targetPath = storageDir + IMAGE_PATH + idprovider + "_map.jpg";
            $cordovaFileTransfer.download(googleMapUrl, targetPath, {}, true).then(function (result) {
            }, function (error) {
                console.log('DownloadProviderMapImg error: ' + JSON.stringify(error));
            });
        },
        getProviderMapImg: function (idprovider) {
            var deferred = $q.defer();
            $cordovaFile.checkFile(storageDir + IMAGE_PATH, idprovider + '_map.jpg').then(function (result) {
                deferred.resolve(result.nativeURL);
            }, function (error) {
                deferred.reject(error.code);
                console.log('getProviderMapImg - error: ' + JSON.stringify(error));
            });
            return deferred.promise;
        }
    }
    return factory;
}]);
