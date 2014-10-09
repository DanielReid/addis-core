'use strict';
define(['angular'], function() {
  var dependencies = [];
  var addisToastDirective = function() {
    return {
      replace: true,
      restrict: 'E',
      template: '<div class="toast-container">' +
        '  <addis-toast-message ng-repeat="message in messages" message="message"></addis-toast-message>' +
        '</div>'
    };
  };

  return dependencies.concat(addisToastDirective);
});
