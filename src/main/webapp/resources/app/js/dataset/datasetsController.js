'use strict';
define([],
  function() {
    var dependencies = ['$scope', '$q', '$modal', '$filter', 'DatasetResource', 'DatasetService'];
    var DatasetsController = function($scope, $q, $modal, $filter, DatasetResource, DatasetService) {

      function loadDatasets() {
        DatasetService.reset();
        DatasetResource.query(function(response) {
          DatasetService.loadStore(response.data).then(function() {
            console.log('loading dataset-store success');
            DatasetService.queryDatasetsOverview().then(function(datasets) {
              $scope.datasets = datasets;
              $scope.datasetsLoaded = true;
            }, function() {
              console.error('failed loading datasetstore');
            });
          });
        });
      }

      loadDatasets();

      $scope.createDatasetDialog = function() {
        $modal.open({
          templateUrl: 'app/js/dataset/createDataset.html',
          controller: 'CreateDatasetController',
          resolve: {
            successCallback: function() {
              return loadDatasets;
            }
          }
        });
      };

      $scope.stripFrontFilter = $filter('stripFrontFilter');

    };
    return dependencies.concat(DatasetsController);
  });


