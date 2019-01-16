userpaApp.factory('snackbar', ['$rootScope', '$timeout', function($rootScope, $timeout) {
	
	var factory = {
			createSnackbar: function(message, actionText, action) {
				var previous = null;
				if (previous) {
					previous.dismiss();
				}
				var snackbar = document.createElement('div');
				snackbar.className = 'snackbar';
				snackbar.dismiss = function() {
					this.style.transform = 'translateY(100%)';
				}
				var text = document.createTextNode(message);
				snackbar.appendChild(text);
				if (actionText) {
					if (!action) {
						action = snackbar.dismiss.bind(snackbar);
					}
					var actionButton = document.createElement('button');
					actionButton.className = 'button button-assertive button-clear';
					actionButton.innerHTML = actionText;
					actionButton.addEventListener('click', action);
					snackbar.appendChild(actionButton);
				}
				$timeout(function() {
					if (previous === this) {
						previous.dismiss();
					}
				}.bind(snackbar), 5000);
				
				snackbar.addEventListener('transitionend', function(event, elapsed) {
					if (event.propertyName === 'transform' && this.style.transform === 'translateY(100%)') {
						this.parentElement.removeChild(this);
						if (previous === this) {
							previous = null;
						}
					}
				}.bind(snackbar));
				
				previous = snackbar;
				document.body.appendChild(snackbar);
				getComputedStyle(snackbar).bottom;
				snackbar.style.bottom = '0px';
				snackbar.style.transform = 'translateY(0%)';
			},
			removeSnackbar: function() {
				var snackbar = document.querySelector('.snackbar');
				if (snackbar) {
					snackbar.style.transform = 'translateY(100%)';
					snackbar.addEventListener('transitionend', function(event, elapsed) {
						if (event.propertyName === 'transform' && this.style.transform == 'translateY(100%)') {
							document.body.removeChild(this);
						}
					}.bind(snackbar));
				}
			}
	};
	return factory;
	
}]);