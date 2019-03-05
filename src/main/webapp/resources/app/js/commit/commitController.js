'use strict';
define([],
  function() {
    var dependencies = [
      '$scope',
      '$modalInstance',
      'userUid',
      'datasetUuid',
      'graphUuid',
      'callback',
      'itemServiceName'
    ];
    var CommitController = function(
      $scope,
      $modalInstance,
      userUid,
      datasetUuid,
      graphUuid,
      callback,
      itemServiceName
    ) {
      $scope.changesCommited = changesCommited;
      $scope.commitCancelled = commitCancelled;

      $scope.userUid = userUid;
      $scope.datasetUuid = datasetUuid;
      $scope.graphUuid = graphUuid;
      $scope.itemServiceName = itemServiceName;

      function changesCommited(newVersion) {
        callback(newVersion);
        $modalInstance.close();
      }

      function commitCancelled() {
        $modalInstance.close();
      }
    };
    return dependencies.concat(CommitController);
  });
