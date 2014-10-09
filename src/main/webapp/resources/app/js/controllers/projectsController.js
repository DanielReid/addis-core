'use strict';
define([], function() {
  var dependencies = ['$scope', '$window', '$location', 'ProjectResource', 'AddisMessageService'];
  var ProjectsController = function($scope, $window, $location, ProjectResource, AddisMessageService) {
    $scope.user = $window.config.user;
    $scope.projects = ProjectResource.query();

    $scope.addMessage = function() {
      AddisMessageService.addMessage('this is a test alert');
    }
  };
  return dependencies.concat(ProjectsController);
});
