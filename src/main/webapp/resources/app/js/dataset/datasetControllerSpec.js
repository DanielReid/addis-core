'use strict';
define(['angular-mocks'], function(angularMocks) {
  describe('the dataset controller', function() {

    var scope, httpBackend,
      mockModal = jasmine.createSpyObj('$mock', ['open']),
      studiesWithDetailsService = jasmine.createSpyObj('StudiesWithDetailsService', ['get', 'getTreatmentActivities', 'addActivitiesToStudies']),
      historyResource = jasmine.createSpyObj('HistoryResource', ['query']),
      conceptsService = jasmine.createSpyObj('ConceptsService', ['loadJson', 'queryItems']),
      versionedGraphResource = jasmine.createSpyObj('VersionedGraphResource', ['get', 'getConceptJson']),
      datasetResource = jasmine.createSpyObj('DatasetResource', ['getForJson']),
      datasetVersionedResource = jasmine.createSpyObj('DatasetVersionedResource', ['getForJson']),
      userService = jasmine.createSpyObj('UserService', ['isLoginUserEmail', 'hasLoggedInUser']),
      dataModelServiceMock = jasmine.createSpyObj('DataModelService', ['correctUnitConceptType']),
      excelExportServiceMock = jasmine.createSpyObj('ExcelExportService', ['exportDataset']),
      datasetDeferred,
      queryHistoryDeferred,
      studiesWithDetailsGetDeferred,
      mockQueryDatasetDeferred,
      conceptsJsonDefer,
      mockStudiesWithDetail = [{
        id: 'study 1'
      }],
      userUid = 'userUid',
      datasetUuid = 'uuid-1',
      versionUuid = 'version-1',
      state = jasmine.createSpyObj('state', ['go']),
      stateParams = {
        userUid: userUid,
        datasetUuid: datasetUuid,
        versionUuid: versionUuid
      };

    beforeEach(angular.mock.module('trialverse.dataset', function($provide){
      $provide.value('ExcelExportService', excelExportServiceMock);
    }));

    beforeEach(angular.mock.module('trialverse.user'));

    beforeEach(inject(function($rootScope, $q, $controller, $httpBackend) {
      scope = $rootScope;
      httpBackend = $httpBackend;

      mockQueryDatasetDeferred = $q.defer();
      studiesWithDetailsGetDeferred = $q.defer();
      queryHistoryDeferred = $q.defer();
      conceptsJsonDefer = $q.defer();
      datasetDeferred = $q.defer();

      studiesWithDetailsService.get.and.returnValue(studiesWithDetailsGetDeferred.promise);
      conceptsService.loadJson.and.returnValue(conceptsJsonDefer.promise);
      versionedGraphResource.getConceptJson.and.returnValue({
        $promise: conceptsJsonDefer.promise
      });
      historyResource.query.and.returnValue({
        $promise: queryHistoryDeferred.promise
      });
      datasetVersionedResource.getForJson.and.returnValue({
        $promise: datasetDeferred.promise
      });
      datasetResource.getForJson.and.returnValue({
        $promise: datasetDeferred.promise
      });

      mockModal.open.calls.reset();

      $controller('DatasetController', {
        $scope: scope,
        $stateParams: stateParams,
        $state: state,
        $modal: mockModal,
        DatasetVersionedResource: datasetVersionedResource,
        DatasetResource: datasetResource,
        StudiesWithDetailsService: studiesWithDetailsService,
        HistoryResource: historyResource,
        ConceptsService: conceptsService,
        VersionedGraphResource: versionedGraphResource,
        UserService: userService,
        DataModelService: dataModelServiceMock
      });

    }));

    describe('on load', function() {

      beforeEach(function() {
        datasetDeferred.resolve({
          'http://purl.org/dc/terms/title': 'title',
          'http://purl.org/dc/terms/description': 'description',
          'http://purl.org/dc/terms/creator': 'creator'
        });
      });

      it('should get the dataset and place its properties on the scope', function() {
        scope.$digest();
        expect(datasetVersionedResource.getForJson).toHaveBeenCalled();
        expect(scope.dataset).toEqual({
          datasetUuid: 'uuid-1',
          title: 'title',
          comment: 'description',
          creator: 'creator'
        });
      });

      it('should get the studies with detail and place them on the scope', function() {
        studiesWithDetailsGetDeferred.resolve(mockStudiesWithDetail);
        scope.$digest();
        expect(scope.studiesWithDetail).toEqual(mockStudiesWithDetail);
      });

      it('should place the table options on the scope', function() {
        expect(scope.tableOptions.columns[0].label).toEqual('Title');
      });

      it('should place the current revision on the scope', function() {
        var historyItems = [{
          'uri': 'http://uri/version-1',
          i: 0
        }];
        queryHistoryDeferred.resolve(historyItems);
        scope.$digest();
        expect(scope.currentRevision).toBeDefined();
      });

      it('should place the concepts on the scope', function() {
        var datasetConcepts = [{
          label: 'concept 1'
        }];
        conceptsJsonDefer.resolve(datasetConcepts);
        scope.$digest();
        expect(scope.datasetConcepts).toBeDefined(); // promise resolved
        expect(versionedGraphResource.getConceptJson).toHaveBeenCalled();
        expect(conceptsService.loadJson).toHaveBeenCalled();
      });

    });

    describe('on load for a head view', function() {
      beforeEach(inject(function($controller) {
        $controller('DatasetController', {
          $scope: scope,
          $window: {},
          $stateParams: {},
          $state: state,
          $modal: mockModal,
          DatasetVersionedResource: datasetVersionedResource,
          DatasetResource: datasetResource,
          StudiesWithDetailsService: studiesWithDetailsService,
          HistoryResource: historyResource,
          ConceptsService: conceptsService,
          VersionedGraphResource: versionedGraphResource,
          UserService: userService
        });
      }));
      it('should get the datasetusing the non versioned resource ', function() {
        expect(datasetResource.getForJson).toHaveBeenCalled();
      });
    });

    describe('showTableOptions', function() {
      it('should open a modal', function() {
        scope.showTableOptions();

        expect(mockModal.open).toHaveBeenCalled();
      });
    });

    describe('showStudyDialog', function() {
      it('should open a modal', function() {
        scope.showStudyDialog();
        expect(mockModal.open).toHaveBeenCalled();
      });
    });

    describe('showCreateProjectDialog', function() {
      it('should open a modal', function() {
        scope.createProjectDialog();
        expect(mockModal.open).toHaveBeenCalled();
      });
    });

  });

});
