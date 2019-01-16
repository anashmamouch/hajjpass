userpaApp.service('migration', ['$cordovaSQLite', '$q', function ($cordovaSQLite, $q) {

    var maxVersion = 1;
    var executeInChain = function (queries) {
        var promise = queries.reduce(function (previous, query) {
            return previous.then(function () {
                return $cordovaSQLite.execute(db, query, []).then(function (result) {
                    console.log('executeInChain - done: ' + JSON.stringify(query));
                    return $q.when(query);
                })
            });
        }, $q.when());
        return promise;
    };

    var selectCurrentVersion = function () {
        var query = 'SELECT MAX(versionNumber) AS maxVersion FROM version_history';
        var promise = $cordovaSQLite.execute(db, query, []).then(function (res) {
            var maxVersion = res.rows.item(0).maxVersion;
            console.log('selectCurrentVersion - current version is: ' + maxVersion);
            return maxVersion;
        });
        return promise;
    };

    var storeVersionHistoryTable = function (versionNumber) {
        var query = 'INSERT INTO version_history (versionNumber, migratedAt) VALUES (?, ?)';
        var promise = $cordovaSQLite.execute(db, query, [versionNumber, new Date()])
            .then(function (res) {
                console.log('Store version in history table: ' + versionNumber);
                return versionNumber;
            });
        return promise;
    };

    var createVersionHistoryTable = function () {
        var query = 'CREATE TABLE IF NOT EXISTS version_history(versionNumber INTEGER primary key not NULL, migratedAt DATE)';
        var promise = $cordovaSQLite.execute(db, query, [])
            .then(function () {
                var versionNumber = 0;
                return versionNumber;
            });
        return promise;
    };

    this.migrate = function () {
        var deferred = $q.defer();
        var initialSteps = [
            createVersionHistoryTable,
            selectCurrentVersion
        ];
        var version1 = {
            versionNumber: 1,
            queries: [
                "CREATE TABLE IF NOT EXISTS otipass (idotipass INTEGER primary key, reference VARCHAR(4), name TEXT, numotipass INTEGER not NULL, status INTEGER not NULL, expiry TEXT,type INTEGER not NULL, pid INTEGER not NULL, day TEXT, service TEXT, package TEXT)",
                "CREATE TABLE IF NOT EXISTS user (iduser INTEGER primary key,login TEXT not NULL, password TEXT not NULL, salt TEXT, profile INTEGER not NULL)",
                "CREATE TABLE IF NOT EXISTS person (idperson INTEGER primay key, title TEXT, lastname TEXT, firstname TEXT, language TEXT, birthdate TEXT, address_id INTEGER, user_id INTEGER)",
                "CREATE TABLE IF NOT EXISTS order_pos (idorder_pos INTEGER primary key AUTOINCREMENT, date TEXT not NULL, price REAL not NULL, otipass_id INTEGER not NULL, provider TEXT not NULL, FOREIGN KEY (otipass_id) REFERENCES otipass (idotipass))",
                "CREATE TABLE IF NOT EXISTS address (idaddress INTEGER primary key, address TEXT, address_2 TEXT, postalcode TEXT, city TEXT, country_code_id TEXT, telephone TEXT, email TEXT)",
                'CREATE TABLE IF NOT EXISTS advertisement (idadvertisement INTEGER primary key, start_date TEXT, end_date TEXT not NULL)',
            ]
        };
        var versions = [
            version1
        ];

        var migrationSteps = versions.map(function (version) {
            return function (currentVersion) {
                if (currentVersion >= version.versionNumber) {
                    return $q.when(currentVersion);
                }
                var promise = executeInChain(version.queries).then(function () {
                    console.log('Migrate - version: ' + version.versionNumber + ' - executed');
                    return version.versionNumber;
                }).then(storeVersionHistoryTable);
                return promise;
            };
        });

        var steps = initialSteps.concat(migrationSteps);

        return steps.reduce(function (current, next) {
            return current.then(next);
        }, $q.when()).then(function () {
            console.log('Migration - All migrations executed');
            deferred.resolve(cOK);
            return deferred.promise;
        }).catch(function (error) {
            console.log('Migration - Error: ' + JSON.stringify(error));
            alert('An error occurs');
            navigator.app.exitApp();
        });
    };

    this.getCurrentVersion = function () {
        var deferred = $q.defer();
        selectCurrentVersion().then(function(res){
            deferred.resolve(res === maxVersion);
        });
        return deferred.promise;
    };

}]);
