'use strict';
define(
  ['angular',
    'require',
    'jQuery',
    'mcda/config',
    'util/constants',
    'mmfoundation',
    'angularanimate',
    'angular-cookies',
    'angular-select',
    'angular-touch',
    'angular-ui-router',
    'angular-md5',
    'ngSanitize',
    'showdown',
    'angularjs-slider',
    'angucomplete-alt',
    'angular-patavi-client',
    'core-js',
    'error-reporting',
    'export-directive',
    'controllers',
    'filters',
    'resources',
    'services',
    'help-popup',
    'page-title-service',
    'search/search',
    'user/user',
    'dataset/dataset',
    'project/project',
    'analysis/analysis',
    'util/util',
    'study/study',
    'excelIO/excelIO',
    'unit/unit',
    'graph/graph',
    'populationInformation/populationInformation',
    'arm/arm',
    'group/group',
    'outcome/outcome',
    'intervention/intervention',
    'outcome/addisOutcomes',
    'variable/variable',
    'populationCharacteristic/populationCharacteristic',
    'endpoint/endpoint',
    'adverseEvent/adverseEvent',
    'epoch/epoch',
    'results/results',
    'measurementMoment/measurementMoment',
    'activity/activity',
    'studyDesign/studyDesign',
    'concept/concept',
    'commit/commit',
    'mapping/mapping',
    'studyInformation/studyInformation',
    'gemtc-web/controllers',
    'gemtc-web/resources',
    'gemtc-web/constants',
    'gemtc-web/services',
    'gemtc-web/directives',
    'gemtc-web/filters',
    'mcda/benefitRisk/benefitRisk',
    'mcda/directives',
    'mcda/effectsTable/effectsTable',
    'mcda/evidence/evidence',
    'mcda/services/workspaceResource',
    'mcda/services/taskDependencies',
    'mcda/services/routeFactory',
    'mcda/services/util',
    'mcda/preferences/preferences',
    'mcda/results/results',
    'mcda/subProblem/subProblem',
    'mcda/workspace/workspace',
    'covariates/covariates',
    'home/home'
  ],
  function(angular, require, $, Config, constants) {
    var mcdaDependencies = [
      'elicit.benefitRisk',
      'elicit.directives',
      'elicit.effectsTable',
      'elicit.evidence',
      'elicit.preferences',
      'elicit.results',
      'elicit.routeFactory',
      'elicit.subProblem',
      'elicit.taskDependencies',
      'elicit.util',
      'elicit.workspace',
      'elicit.workspaceResource',
      'mm.foundation',
      'ngAnimate'
    ];
    var dependencies = [
      'ui.router',
      'ngSanitize',
      'ui.select',
      'angular-md5',
      'ngCookies',
      'mm.foundation.modal',
      'mm.foundation.tabs',
      'help-directive',
      'addis.home',
      'addis.project',
      'addis.analysis',
      'addis.controllers',
      'addis.resources',
      'addis.services',
      'addis.filters',
      'addis.covariates',
      'addis.interventions',
      'addis.outcomes',
      'addis.excelIO',
      'patavi',
      'page-title-service',
      'errorReporting',
      'export-directive', 
      'angucomplete-alt'
    ];
    var gemtcWebDependencies = [
      'gemtc.controllers',
      'gemtc.resources',
      'gemtc.constants',
      'gemtc.services',
      'gemtc.directives',
      'gemtc.filters'
    ];
    var trialverseDependencies = [
      'trialverse.search',
      'trialverse.user',
      'trialverse.dataset',
      'trialverse.util',
      'trialverse.graph',
      'trialverse.study',
      'trialverse.populationInformation',
      'trialverse.arm',
      'trialverse.group',
      'trialverse.outcome',
      'trialverse.variable',
      'trialverse.populationCharacteristic',
      'trialverse.endpoint',
      'trialverse.adverseEvent',
      'trialverse.epoch',
      'trialverse.measurementMoment',
      'trialverse.studyDesign',
      'trialverse.activity',
      'trialverse.results',
      'trialverse.concept',
      'trialverse.commit',
      'trialverse.mapping',
      'trialverse.studyInformation',
      'trialverse.unit'
    ];

    Number.isInteger = Number.isInteger || function(value) {
      return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
    };

    var app = angular.module('addis', dependencies.concat(mcdaDependencies, gemtcWebDependencies, trialverseDependencies));

    app.constant('Tasks', Config.tasks);
    app.constant('DEFAULT_VIEW', 'evidence');
    app.constant('currentSchemaVersion', '1.1.0');
    app.constant('ANALYSIS_TYPES', [{
      label: 'Evidence synthesis',
      stateName: 'networkMetaAnalysis'
    }, {
      label: 'Benefit-risk analysis',
      stateName: 'BenefitRiskCreationStep-1'
    }]);
    app.constant('mcdaRootPath', 'app/js/bower_components/mcda-web/app/');
    app.constant('gemtcRootPath', 'app/js/bower_components/gemtc-web/app/');
    app.constant('isGemtcStandAlone', false);
    app.constant('isMcdaStandalone', false);

    app.config(['$locationProvider', function($locationProvider) {
      $locationProvider.hashPrefix('');
    }]);

    app.run(['$rootScope', '$window', '$http', '$location', '$transitions', '$cookies', 'HelpPopupService', 'CacheService', 'PageTitleService',
      function($rootScope, $window, $http, $location, $transitions, $cookies, HelpPopupService, CacheService, PageTitleService) {
        $rootScope.$safeApply = function($scope, fn) {
          var phase = $scope.$root.$$phase;
          if (phase === '$apply' || phase === '$digest') {
            this.$eval(fn);
          } else {
            this.$apply(fn);
          }
        };

        HelpPopupService.loadLexicon($http.get('app/js/bower_components/gemtc-web/app/lexicon.json'));
        HelpPopupService.loadLexicon($http.get('app/js/bower_components/mcda-web/app/lexicon.json'));
        HelpPopupService.loadLexicon($http.get('addis-lexicon.json'));

        PageTitleService.loadLexicon($http.get('app/js/bower_components/mcda-web/app/mcda-page-titles.json'));
        PageTitleService.loadLexicon($http.get('addis-page-titles.json'));

        $transitions.onSuccess({}, function(transition) {
          var redirectUrl = $cookies.get('returnToPage');
          if (transition.to().name === 'datasets' && transition.from().name === '' && redirectUrl && redirectUrl !== '/') {
            $cookies.remove('returnToPage');
            $location.path(redirectUrl);
          }
          $window.scrollTo(0, 0);
        });

        $rootScope.$on('modelResultsAvailable', function(event, ids) {
          CacheService.evict('modelPromises', ids.modelId);
          CacheService.evict('consistencyModelsPromises', ids.projectId);
          CacheService.evict('modelsByProjectPromises', ids.projectId);
        });

        $rootScope.$on('primaryModelSet', function(event, ids) {
          CacheService.evict('analysisPromises', ids.analysisId);
          CacheService.evict('analysesPromises', ids.projectId);
        });
      }
    ]);

    app.config(function(uiSelectConfig) {
      uiSelectConfig.theme = 'select2';
    });

    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'MCDARouteProvider',
      function($stateProvider, $urlRouterProvider, $httpProvider, MCDARouteProvider) {
        var baseTemplatePath = 'app/views/';
        var mcdaBaseTemplatePath = 'app/js/bower_components/mcda-web/app/views/';
        var gemtcWebBaseTemplatePath = 'app/js/bower_components/gemtc-web/app/';

        $httpProvider.interceptors.push('SessionExpiredInterceptor');

        // Default route
        $urlRouterProvider.otherwise(function($injector) {
          var $window = $injector.get('$window');
          var $state = $injector.get('$state');
          if ($window.config && $window.config.user) {
            $state.go('datasets', {
              userUid: $window.config.user.id
            });
          } else {
            $state.go('home');
          }

        });

        $stateProvider
          .state('home', {
            url: '/',
            templateUrl: 'app/js/home/home.html',
            controller: 'HomeController',
          })
          .state('user', {
            abstract: true,
            url: '/users/:userUid',
            templateUrl: 'app/js/user/user.html',
            controller: 'UserController',
          })
          .state('projects', {
            url: '/projects',
            parent: 'user',
            templateUrl: baseTemplatePath + 'projects.html',
            controller: 'ProjectsController'
          })
          .state('datasets', {
            url: '/datasets',
            parent: 'user',
            templateUrl: 'app/js/dataset/datasets.html',
            controller: 'DatasetsController'
          })
          .state('search', {
            url: '/search?searchTerm',
            parent: 'user',
            templateUrl: 'app/js/search/search.html',
            controller: 'SearchController'
          })
          .state('create-project', {
            url: '/users/:userUid/projects/create-project',
            templateUrl: baseTemplatePath + 'createProject.html',
            controller: 'CreateProjectController'
          })
          .state('project', {
            url: '/users/:userUid/projects/:projectId',
            templateUrl: baseTemplatePath + 'project.html',
            controller: 'SingleProjectController',
            resolve: {
              activeTab: function() {
                return 'definitions';
              },
              project: ['$stateParams', 'ProjectResource', function($stateParams, ProjectResource) {
                return ProjectResource.get($stateParams).$promise;
              }]
            }
          })
          .state('projectReport', {
            url: '/report',
            templateUrl: baseTemplatePath + 'project.html',
            controller: 'SingleProjectController',
            parent: 'project',
            resolve: {
              activeTab: function() {
                return 'report';
              }
            }
          })
          .state('projectAnalyses', {
            url: '/analyses',
            templateUrl: baseTemplatePath + 'project.html',
            controller: 'SingleProjectController',
            parent: 'project',
            resolve: {
              activeTab: function() {
                return 'analyses';
              }
            }
          })
          .state('editReport', {
            url: '/editReport',
            templateUrl: 'app/js/project/report/editReport.html',
            controller: 'EditReportController',
            parent: 'project'
          })
          .state('networkMetaAnalysisContainer', {
            templateUrl: baseTemplatePath + 'networkMetaAnalysisContainer.html',
            controller: 'NetworkMetaAnalysisContainerController',
            url: '/users/:userUid/projects/:projectId/nma/:analysisId',
            resolve: {
              currentAnalysis: ['$stateParams', 'AnalysisResource',
                function($stateParams, AnalysisResource) {
                  return AnalysisResource.get($stateParams).$promise;
                }
              ],
              currentProject: ['$stateParams', 'ProjectResource',
                function($stateParams, ProjectResource) {
                  return ProjectResource.get({
                    projectId: $stateParams.projectId
                  }).$promise;
                }
              ]
            },
            abstract: true
          })
          // Evidence synthesis states
          .state('networkMetaAnalysis', {
            parent: 'networkMetaAnalysisContainer',
            url: '',
            views: {
              'networkMetaAnalysis': {
                templateUrl: baseTemplatePath + 'networkMetaAnalysisView.html'
              },
              'models': {
                templateUrl: gemtcWebBaseTemplatePath + '/js/models/models.html',
                controller: 'ModelsController'
              },
              'network': {
                templateUrl: baseTemplatePath + 'network.html'
              },
              'evidenceTable': {
                templateUrl: baseTemplatePath + 'evidenceTable.html'
              }
            }
          })
          .state('nmaModelContainer', {
            templateUrl: baseTemplatePath + 'networkMetaAnalysisModelContainerView.html',
            controller: 'NetworkMetaAnalysisModelContainerController',
            abstract: true,
          })
          .state('createModel', {
            parent: 'nmaModelContainer',
            url: '/users/:userUid/projects/:projectId/nma/:analysisId/models/createModel',
            templateUrl: gemtcWebBaseTemplatePath + 'js/models/createModel.html',
            controller: 'CreateModelController'
          })
          .state('refineModel', {
            parent: 'nmaModelContainer',
            url: '/users/:userUid/projects/:projectId/nma/:analysisId/models/:modelId/refineModel',
            templateUrl: gemtcWebBaseTemplatePath + 'js/models/createModel.html',
            controller: 'CreateModelController',
            resolve: {
              model: ['$stateParams', 'RefineModelService',
                function($stateParams, RefineModelService) {
                  return RefineModelService.getRefinedModel($stateParams);
                }
              ]
            }
          })
          .state('model', {
            url: '/users/:userUid/projects/:projectId/nma/:analysisId/models/:modelId',
            parent: 'nmaModelContainer',
            templateUrl: gemtcWebBaseTemplatePath + 'views/modelView.html',
            controller: 'ModelController',
            resolve: {
              currentAnalysis: ['$stateParams', 'AnalysisResource',
                function($stateParams, AnalysisResource) {
                  return AnalysisResource.get($stateParams).$promise;
                }
              ],
              currentProject: ['$stateParams', 'ProjectResource',
                function($stateParams, ProjectResource) {
                  return ProjectResource.get({
                    projectId: $stateParams.projectId
                  }).$promise;
                }
              ]
            },
          })
          .state('nodeSplitOverview', {
            parent: 'model',
            url: '/nodeSplitOverview',
            templateUrl: gemtcWebBaseTemplatePath + 'js/models/nodeSplitOverview.html',
            controller: 'NodeSplitOverviewController',
            resolve: {
              models: ['$stateParams', 'ModelResource',
                function($stateParams, ModelResource) {
                  return ModelResource.query({
                    projectId: $stateParams.projectId,
                    analysisId: $stateParams.analysisId
                  }).$promise;
                }
              ],
              problem: ['$stateParams', 'ProblemResource',
                function($stateParams, ProblemResource) {
                  return ProblemResource.get({
                    projectId: $stateParams.projectId,
                    analysisId: $stateParams.analysisId
                  }).$promise;
                }
              ]

            }
          })
          // meta-benefit-risk states
          .state('BenefitRiskCreationStep-1', {
            url: '/users/:userUid/projects/:projectId/br/:analysisId/step-1',
            templateUrl: 'app/js/analysis/brStep-1.html',
            controller: 'BenefitRiskStep1Controller'
          })
          .state('BenefitRiskCreationStep-2', {
            url: '/users/:userUid/projects/:projectId/br/:analysisId/step-2',
            templateUrl: 'app/js/analysis/brStep-2.html',
            controller: 'BenefitRiskStep2Controller'
          })
          .state('BenefitRisk', {
            url: '/users/:userUid/projects/:projectId/br/:analysisId',
            templateUrl: 'app/js/analysis/br.html',
            controller: 'BenefitRiskController'
          })
          // trialverse states
          .state('dataset', {
            url: '/users/:userUid/datasets/:datasetUuid',
            templateUrl: 'app/js/dataset/dataset.html',
            controller: 'DatasetController'
          })
          .state('dataset.concepts', {
            url: '/concepts',
            templateUrl: 'app/js/concept/concepts.html',
            controller: 'ConceptsController'
          })
          .state('dataset.study', {
            url: '/studies/:studyGraphUuid',
            templateUrl: 'app/js/study/view/study.html',
            controller: 'StudyController'
          })
          .state('datasetHistory', {
            url: '/users/:userUid/datasets/:datasetUuid/history',
            templateUrl: 'app/js/dataset/datasetHistory.html',
            controller: 'DatasetHistoryController'
          })
          .state('studyHistory', {
            url: '/users/:userUid/datasets/:datasetUuid/studies/:studyGraphUuid/history',
            templateUrl: 'app/js/dataset/studyHistory.html',
            controller: 'StudyHistoryController'
          })
          .state('versionedDataset', {
            url: '/users/:userUid/datasets/:datasetUuid/versions/:versionUuid',
            templateUrl: 'app/js/dataset/dataset.html',
            controller: 'DatasetController'
          })
          .state('versionedDataset.concepts', {
            url: '/concepts',
            templateUrl: 'app/js/concept/concepts.html',
            controller: 'ConceptsController'
          })
          .state('versionedDataset.study', {
            url: '/studies/:studyGraphUuid',
            templateUrl: 'app/js/study/view/study.html',
            controller: 'StudyController'
          })
          // mcda states
          .state('benefitRisk', {
            abstract: true,
            controller: 'AbstractBenefitRiskController',
            url: '/users/:userUid/projects/:projectId/benefitRisk/:analysisId',
            templateUrl: 'app/js/analysis/benefitRiskContainer.html',
            resolve: {
              currentAnalysis: ['$stateParams', 'AnalysisResource',
                function($stateParams, AnalysisResource) {
                  return AnalysisResource.get($stateParams).$promise;
                }
              ],
              currentProject: ['$stateParams', 'ProjectResource',
                function($stateParams, ProjectResource) {
                  return ProjectResource.get($stateParams).$promise;
                }
              ]
            }
          });

        MCDARouteProvider.buildRoutes($stateProvider, 'benefitRisk', mcdaBaseTemplatePath);

      }
    ]);
    app.constant('CONCEPT_GRAPH_UUID', 'concepts');
    app.constant('GROUP_ALLOCATION_OPTIONS', constants.GROUP_ALLOCATION_OPTIONS);
    app.constant('BLINDING_OPTIONS', constants.BLINDING_OPTIONS);
    app.constant('STATUS_OPTIONS', constants.STATUS_OPTIONS);

    return app;
  });
