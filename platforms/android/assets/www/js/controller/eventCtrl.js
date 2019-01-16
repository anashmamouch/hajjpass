userpaApp.controller('eventCtrl', ['sqliteFactory', '$q', '$scope', '$rootScope', '$stateParams',  function(sqliteFactory, $filter,  $q, $scope, $rootScope,$stateParams){
	
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
	
	$scope.provider = [];
	$scope.events = [];
	$scope.today = new Date();
	
	sqliteFactory.getEventByProvider($stateParams.id).then(function success(result){
		var eventTab = [];
		var eventTabPast = [];
		for(var j = 0; j < result.rows.length; j++){
			var evnt = result.rows.item(j);
			if (evnt.id_address == null) {
					var event = {idevent : evnt.idevent, name: evnt.name, description: evnt.description, type: evnt.type, start_date: evnt.start_date, end_date: evnt.end_date, place_name: evnt.place_name, address_id: evnt.address_id, provider_id: evnt.provider_id};
					var startDate = event.start_date.split(' '); 
                    event.start_date = new Date(startDate[0].split('-')[0], startDate[0].split('-')[1]-1, startDate[0].split('-')[2], startDate[1].split(':')[0], startDate[1].split(':')[1], startDate[1].split(':')[2]); 
                    var endDate = event.end_date.split(' '); 
                    event.end_date = new Date(endDate[0].split('-')[0], endDate[0].split('-')[1]-1, endDate[0].split('-')[2], endDate[1].split(':')[0], endDate[1].split(':')[1], endDate[1].split(':')[2]);   
                    if (event.start_date.getTime() >= $scope.today.getTime() || event.end_date.getTime() >= $scope.today.getTime()) {
						soonOrNow = true;
						eventTab.push(event);
					} else {
						soonOrNow = false;
						eventTabPast.push(event);
					}
			} else {
				sqliteFactory.getAddressById(evnt.id_address).then(function success(res){
					evnt.address = res.address;
					var event = {idevent : evnt.idevent, name: evnt.name, description: evnt.description, type: evnt.type, start_date: evnt.start_date, end_date: evnt.end_date, place_name: evnt.place_name, address_id: evnt.address_id, provider_id: evnt.provider_id, address: evnt.address};
					eventTab.push(event);
				})
					
			}
			
			
		}
		$scope.events = eventTab;
		$scope.eventspast = eventTabPast;
	});
	
}]);