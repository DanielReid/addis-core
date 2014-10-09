'use strict';
define(['angular'], function() {
  var dependencies = ['AddisMessageService'];
  var addisToastMessageDirective = function(AddisMessageService) {
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
            AddisMessageService.removeMessage(scope.message);
            scope.close();
          });
        };
      },
      templateUrl: 'app/partials/addisToastMessage.html'
    };
  };

  return dependencies.concat(addisToastMessageDirective);
});
