'use strict';
define(['angular'], function() {
  var dependencies = [];
  var addisToastMessageDirective = function() {
    return {
      replace: true,
      transclude: true,
      restrict: 'E',
      scope: {
        message: '='
      },
      link: function(scope, element) {
        scope.animatedClose = function() {
          $(element).fadeOut(800, function() {
            scope.close();
          });
        };
      }
      templateUrl: 'partials/addisToastMessage.html'
    };
  };

  return dependencies.concat(addisToastMessageDirective);
});
