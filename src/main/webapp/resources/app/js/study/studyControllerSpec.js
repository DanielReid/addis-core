'use strict';
define(['angular-mocks'], function(angularMocks) {
  describe('the study controller', function() {

    var scope,
      userUid = 'userUid',
      datasetUuid = 'datasetUuid',
      studyGraphUuid = 'studyGraphUuid',
      versionUuid = 'versionUuid',
      mockStateParams = {
        userUid: userUid,
        datasetUuid: datasetUuid,
        studyGraphUuid: studyGraphUuid,
        versionUuid: versionUuid
      },
      anchorScrollMock = jasmine.createSpy('anchorScroll'),
      locationMock = jasmine.createSpyObj('location', ['hash']),
      modalMock = jasmine.createSpyObj('modal', ['open']),
      studyService = jasmine.createSpyObj('StudyService', ['reset', 'loadJson', 'getStudy',
        'studySaved', 'isStudyModified'
      ]),
      excelExportService = jasmine.createSpyObj('ExcelExportService',['exportStudy']),
      resultsServiceMock = jasmine.createSpyObj('ResultsService', ['cleanupMeasurements']),
      studyDesignServiceMock = jasmine.createSpyObj('StudyDesignService', ['cleanupCoordinates']),
      graphResource = jasmine.createSpyObj('GraphResource', ['getJson']),
      versionedGraphResource = jasmine.createSpyObj('VersionedGraphResource', ['getJson']),
      userService = jasmine.createSpyObj('UserService', ['hasLoggedInUser']),
      transitionMock = jasmine.createSpyObj('$transitions', ['onStart']),
      queryStudyDataDeferred,
      queryArmDataDeferred,
      getGraphDeferred,
      loadJsonDefferd,
      getJsonResultDefferd,
      getJsonDeferred;


    beforeEach(module('trialverse.study'));
    beforeEach(module('trialverse.user'));

    beforeEach(angularMocks.inject(function($rootScope, $q) {

      scope = $rootScope;
      spyOn(scope, '$broadcast');

      queryStudyDataDeferred = $q.defer();
      queryArmDataDeferred = $q.defer();
      getGraphDeferred = $q.defer();
      getJsonDeferred = $q.defer();
      loadJsonDefferd = $q.defer();
      getJsonResultDefferd = $q.defer();

      studyService.loadJson.and.returnValue(getJsonDeferred.promise);
    }));

    describe('on load of versionedView', function() {

      var jsonResultDefer;
      var getJsonResult;
      var getStudyResult;

      beforeEach(angularMocks.inject(function($q, $controller) {

        jsonResultDefer = $q.defer();
        getJsonResult = {
          $promise: jsonResultDefer.promise,
          mockJson: '123'
        };
        versionedGraphResource.getJson.and.returnValue(getJsonResult);

        getStudyResult = $q.defer();
        studyService.getStudy.and.returnValue(getStudyResult.promise);

        $controller('StudyController', {
          $scope: scope,
          $state: {},
          $stateParams: mockStateParams,
          $transitions: transitionMock,
          VersionedGraphResource: versionedGraphResource,
          GraphResource: graphResource,
          $location: locationMock,
          $anchorScroll: anchorScrollMock,
          $modal: modalMock,
          $window: {
            bind: 'mockBind',
            innerHeight: 'innerHeightMock'
          },
          StudyService: studyService,
          ExcelExportService: excelExportService,
          ResultsService: resultsServiceMock,
          StudyDesignService: studyDesignServiceMock,
          UserService: userService
        });
      }));

      it('should reset the study service', function() {
        expect(studyService.reset).toHaveBeenCalled();
      });

      it('should load the study data', function() {
        expect(versionedGraphResource.getJson).toHaveBeenCalled();
      });

      it('should place loaded data into fontend cache', function() {
        expect(studyService.loadJson).toHaveBeenCalledWith(getJsonResult.$promise);
      });

      it('should use the loaded data to fill the view and alert the subviews', function() {
        jsonResultDefer.resolve({
          bla: 'bla'
        });
        scope.$digest();
        expect(studyService.getStudy).toHaveBeenCalled();
        getStudyResult.resolve({
          study: 'studyjson'
        });
        scope.$digest();
        expect(studyService.studySaved).toHaveBeenCalled();
        expect(scope.$broadcast).toHaveBeenCalledWith('refreshStudyDesign');
        expect(scope.$broadcast).toHaveBeenCalledWith('refreshResults');
      });



    });

  });
});
