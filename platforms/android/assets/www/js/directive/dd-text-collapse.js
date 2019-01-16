// a directive to auto-collapse long text
userpaApp.directive('ddCollapseText', ['$compile', '$translate', '$sanitize', function($compile, $translate, $sanitize) {
return {
    restrict: 'A',
    replace: true,
    link: function(scope, element, attrs) {

        // start collapsed
        scope.collapsed = false;

        // create the function to toggle the collapse
        scope.toggle = function() {
            scope.collapsed = !scope.collapsed;
        };

        // get the value of the dd-collapse-text attribute
        attrs.$observe('ddCollapseText', function(maxLength) {
            // get the contents of the element
            var text = element.text();
            text = $sanitize(text);

            if (text.length > maxLength) {
                // chack if text contains html tags and remove them
                 text = text.replace(/\n/g, "<br />");
                // split the text in two parts, the first always showing
                var firstPart = String(text).substring(0, maxLength);
                var secondPart = String(text).substring(maxLength, text.length);
                //re-trim the text if we are in middle of a word
                firstPart = firstPart.substr(0, Math.min(firstPart.length, firstPart.lastIndexOf(" ")));
                secondPart = text.substr(Math.max(firstPart.length, firstPart.indexOf(" ")), text.length); 

                // create some new html elements to hold the separate info
                var html = '<span>' + firstPart + '</span>';
                html += '<span ng-if="collapsed">' + secondPart + '</span>';
                html += '<span ng-if="!collapsed">...</span>';
                html += '<span class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "' + $translate.instant("see_less") + '" : "' + $translate.instant("see_more") +'"}}  </span>';
                
                // remove the current contents of the element
                // and add the new ones we created
                html = angular.element(html);
                element.empty();
                element.append(html);
                $compile(html)(scope);
            }
        });
    }
};
}]);
