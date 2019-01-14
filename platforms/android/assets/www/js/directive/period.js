userpaApp.directive('period', ['$compile', '$translate', '$filter', 'moment', function($compile, $translate, $filter, moment) {

	return {
		restrict: 'E',
		scope: {
			startDate: '=startDate',
			endDate: '=endDate'
		},
		link: function (scope, element, attrs) {
			var startDate = moment(scope.startDate).toDate(),
				startDateDay = startDate.getDate(),
				startDateMonth = startDate.getMonth(),
				startDateYear = startDate.getFullYear(),
				startDateHour = startDate.getHours(),
				startDateMinutes = startDate.getMinutes(),
				endDate = moment(scope.endDate).toDate(),
				endDateDay = endDate.getDate(),
				endDateMonth = endDate.getMonth(),
				endDateYear = endDate.getFullYear(),
				endDateHour = endDate.getHours(),
				endDateMinutes = endDate.getMinutes(),
				today = new Date();
			if (startDateYear == endDateYear && startDateMonth == endDateMonth && startDateDay == endDateDay) {
				if (startDateHour != endDateHour && startDateDay != today.getDate()) {
					var html = '<span class="date">'+$filter('date')(startDate, 'EEEE dd MMMM yyyy')+' '+$translate.instant('from')+' '+$filter('date')(startDate, 'HH:mm')+' '+$translate.instant('to')+' '+$filter('date')(endDate, 'HH:mm')+'</span>';
					html = angular.element(html);
					element.append(html);
					$compile(html)(scope);
				}
				if (startDateDay == today.getDate()) {
					var html = '<span class="date">'+$translate.instant('today_at')+' '+$filter('date')(startDate, 'HH:mm')+'</span>';
					html = angular.element(html);
					element.append(html);
					$compile(html)(scope);
				}
			} else {
				var html = '<span class="date">'+$filter('date')(startDate, 'dd/MM/yyyy')+' - '+$filter('date')(endDate, 'dd/MM/yyyy')+'</span>';
				html = angular.element(html);
				element.append(html);
				$compile(html)(scope);
			}
		}
	}

}]);