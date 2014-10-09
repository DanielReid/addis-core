'use strict';
define(['angular', 'underscore'], function() {
  var dependencies = [];
  var AddisMessageService = function() {
    var messages = [];

    var guid = (function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      };
    })();

    function addMessage(messageStr) {
      var message = {
        id: guid(),
        message: messageStr,
        type: 'info'
      };
      messages.push(message);
    }

    function removeMessage(message) {
      var index = messages.indexOf(message);
      messages.splice(index, 1);
    }

    function getMessages() {
      return messages;
    }

    return {
      addMessage: addMessage,
      removeMessage: removeMessage,
      getMessages: getMessages
    };
  };
  return dependencies.concat(AddisMessageService);
});