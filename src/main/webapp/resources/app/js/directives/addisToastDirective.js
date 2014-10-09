'use strict';
define(['angular'], function() {
  var dependencies = ['AddisMessageService'];
  var addisToastDirective = function(AddisMessageService) {
    return {
      replace: true,
      restrict: 'E',
      link: function(scope) {
        scope.messages = AddisMessageService.getMessages();
      },
      template: '<div class="toast-container">' +
        '  <addis-toast-message ng-repeat="message in messages" message="message">' + 
        '{{message.message}}</addis-toast-message>' +
        '</div>'
    };
  };

  return dependencies.concat(addisToastDirective);
});
