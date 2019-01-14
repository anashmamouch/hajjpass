userpaApp.directive('ripple', [function() {
	
	return {
		restrict: 'C',
		link: function (scope, elem, attrs) {
			elem[0].style.position = 'relative';
			elem[0].style.overflow = 'hidden';
			elem[0].style.userSelect = 'none';			
			elem[0].style.msUserSelect = 'none';
			elem[0].style.mozUserSelect = 'none';
			elem[0].style.webkitUserSelect = 'none';
			
			function createRipple(event) {
				var ripple = angular.element('<span class="ripple-effect animate">'),
	              rect = elem[0].getBoundingClientRect(),
	              radius = Math.max(rect.height, rect.width),
	              left = event.pageX - rect.left - radius / 2 - document.body.scrollLeft,
	              top = event.pageY - rect.top - radius / 2 - document.body.scrollTop;

	            ripple[0].style.width = ripple[0].style.height = radius + 'px';
	            ripple[0].style.left = left + 'px';
	            ripple[0].style.top = top + 'px';
	            ripple.on('animationend webkitAnimationEnd', function() {
	              angular.element(this).remove();
	            });

	            elem.append(ripple);
			}
			elem.on('click', createRipple);
		}
	}
	
}]);