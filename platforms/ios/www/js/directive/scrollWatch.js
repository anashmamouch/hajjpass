userpaApp.directive('scrollwatch', ['$rootScope', function($rootScope) {

	return function (scope, elem, attr) {
		$rootScope.providerName = '';
		var start = 0,
			threshold = (elem[0].offsetHeight < 720) ? 200 : 400;
						
		elem.bind('scroll', function(e) {
			var header = document.querySelector('.nav-bar-block[nav-bar="active"] ion-header-bar.bar-clear');
			var scrollTop = (devicePlatform == 'android' ? e.target.scrollTop : e.originalEvent.detail.scrollTop);
			if (scrollTop  - start > threshold) {
				e.stopPropagation();
				$rootScope.providerName = scope.provider.name;
				header.setAttribute('style', 'background-color:#871036;');
			} else {
				$rootScope.providerName = '';
				header.setAttribute('style', 'background-color:transparent;');
			}
			$rootScope.$apply();
		});
	};
	
}]);
