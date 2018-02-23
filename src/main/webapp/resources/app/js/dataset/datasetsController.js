'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modal', '$filter', '$stateParams', '$state', 'DatasetResource', 'UserService'];

  var DatasetsController = function($scope, $modal, $filter, $stateParams, $state, DatasetResource, UserService) {
    // functions
    $scope.reloadDatasets = reloadDatasets;
    $scope.createDatasetDialog = createDatasetDialog;
    $scope.createProjectDialog = createProjectDialog;

    // init
    $scope.stripFrontFilter = $filter('stripFrontFilter');
    $scope.datasetsLoaded = false;
    $scope.loginUser = UserService.getLoginUser();
    $scope.showCreateProjectButton = UserService.hasLoggedInUser();

    reloadDatasets();

    function reloadDatasets() {
      $scope.datasetsLoaded = false;
      DatasetResource.queryForJson($stateParams, function(datasets) {
        $scope.datasets = datasets;
        $scope.datasetsLoaded = true;
      });
    }

    function createDatasetDialog() {
      $modal.open({
        templateUrl: 'app/js/user/createDataset.html',
        controller: 'CreateDatasetController',
        resolve: {
          callback: function() {
            return reloadDatasets;
          },
          datasetTitles: function(){
            return _.map($scope.datasets, 'title');
          }
        }
      });
    }

    function createProjectDialog(dataset) {
      $modal.open({
        templateUrl: 'app/js/project/createProjectModal.html',
        controller: 'CreateProjectModalController',
        resolve: {
          callback: function() {
            return function(newProject) {
              $state.go('project', {
                projectId: newProject.id
              });
            };
          },
          dataset: function() {
            return dataset;
          }
        }
      });
    }

  };
  return dependencies.concat(DatasetsController);
});