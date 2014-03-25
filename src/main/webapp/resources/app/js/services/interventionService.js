'use strict';
define([], function () {
  var dependencies = ['$resource'];
  var InterventionService = function ($resource) {
    return $resource('/projects/:projectId/interventions/:interventionId', {
      projectId: '@projectId',
      interventionId: '@id'
    });
  };
  return dependencies.concat(InterventionService);
});