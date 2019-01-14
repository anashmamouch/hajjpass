userpaApp.factory('synchro', ['$interval', 'loginFactory', "$filter", 'providerFactory', '$rootScope', 'localStorage', 'sqliteFactory', '$cordovaLocalNotification', '$ionicLoading', '$q', 'connectivityMonitor', 'snackbar', '$translate', function ($interval, loginFactory, $filter, providerFactory, $rootScope, localStorage, sqliteFactory, $cordovaLocalNotification, $ionicLoading, $q, connectivityMonitor, snackbar, $translate) {
    var factory = {
        sync: undefined,
        syncNow: function (){
            var deferred = $q.defer();
            if (connectivityMonitor.isOnline()) {
                loginFactory.adminConnect(true).then(function success(response) {
                    if (response == '200') {
                        $q.all([factory.syncList(), factory.syncAds()]).then(function success() {
                            loginFactory.disconnect();
                            deferred.resolve(cOK);
                        }, function error() {
                            loginFactory.disconnect();
                            deferred.resolve(cErr);
                        });
                    } else {
                        deferred.resolve(cErr);
                        snackbar.createSnackbar($translate.instant('error_sync'));
                    }
                }, function error(response) {
                    deferred.resolve(cErr);
                    snackbar.createSnackbar($translate.instant('error_sync'));
                });
            } else {
                deferred.resolve(cErr);
            }
            return deferred.promise;
        },
        initSynchronization: function () {
            if (angular.isDefined(factory.sync)) return;
            factory.sync = $interval(function() {
                factory.syncNow();
            }, syncTime);
        },
        syncAds: function () {
            var deferred = $q.defer();
            sqliteFactory.getAdLastId().then(function success(lastUpdate) {
                if (lastUpdate.file_last_update == "") {
                    var date = new Date(1970, 01, 01, 00, 00, 00, 00);
                    lastUpdate.file_last_update = $filter('date')(date, "yyyy-MM-dd HH:mm:ss");
                }
                console.log('initSynchro - lastUpdate: ' + lastUpdate.lastId + " - " + lastUpdate.file_last_update);
                sqliteFactory.insertAdvertisements(lastUpdate.lastId, lastUpdate.file_last_update).then(function success(response) {
                    if (response == !false) {

                    }
                    console.log("Advertisement Sync done");
                    deferred.resolve(cOK);
                }, function error() {
                    console.log("Advertisement Sync KO");
                    deferred.reject('err Advertisement sync');
                });
            })
            return deferred.promise;
        },
        syncList : function () {
            var deferred = $q.defer();

        },
        destroySync: function () {
            if (angular.isDefined(factory.sync)) {
                $interval.cancel(factory.sync);
                factory.sync = undefined;
            }
        }
    };
    return factory;
}]);
