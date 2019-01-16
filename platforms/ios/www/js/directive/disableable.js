userpaApp.directive('disableable', ['$parse', function($parse) {

	return {
		restrict: 'C',
		priority: 100,
		require: '?ngClick',
		link: {
			pre: function(scope, elem, attrs, ngClick) {
				if (attrs.disable) {
					var disable = $parse(attrs.disable);
					
					elem.bind('click', function (e) {
						if (disable(scope)) {
							e.stopImmediatePropagation();
							return false;
						} else {
							return true;
						}
					});
					
					scope.$watch(disable, function(val) {
						if (val) {
							elem.addClass('disabled');
							elem.css('cursor', 'default');
						} else {
							elem.removeClass('disabled');
							elem.css('cursor', 'pointer');
						}
					});
				}
			}
		}
	};
	
}]);
