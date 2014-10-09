'use strict';
define([], function() {
  var dependencies = ['$scope', '$window', '$location', 'ngToast', 'ProjectResource'];
  var ProjectsController = function($scope, $window, $location, ngToast, ProjectResource) {
    $scope.user = $window.config.user;
    $scope.projects = ProjectResource.query();
    ngToast.create('a toast');
  };
  return dependencies.concat(ProjectsController);
});
