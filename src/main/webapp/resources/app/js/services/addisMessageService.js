'use strict';
define(['angular', 'underscore'], function () {
  var dependencies = [];
  var AddisMessageService = function () {
    var messages = [];

    function addMessage(message) {
      messages.push(message);
    }

    function removeMessage(message) {
      var index = message.indexOf(message);
      messages.splice(index, 1);
    }

    return {
      addMessage : addMessage,
      removeMessage: removeMessage
    };
  };
  return dependencies.concat(AddisMessageService);
});
