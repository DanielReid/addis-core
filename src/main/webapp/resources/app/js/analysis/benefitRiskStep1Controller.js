'use strict';
define(['lodash', 'angular'], function(_, angular) {
  var dependencies = ['$scope', '$q', '$stateParams', '$state',
    'ProjectStudiesResource',
    'AnalysisResource', 'InterventionResource',
    'OutcomeResource', 'BenefitRiskService',
    'ModelResource', 'ProjectResource', 'UserService', 'SingleStudyBenefitRiskService'
  ];
  var BenefitRiskStep1Controller = function($scope, $q, $stateParams, $state,
    ProjectStudiesResource,
    AnalysisResource, InterventionResource,
    OutcomeResource, BenefitRiskService,
    ModelResource, ProjectResource, UserService, SingleStudyBenefitRiskService) {
    // functions
    $scope.addedAlternative = addedAlternative;
    $scope.removedAlternative = removedAlternative;
    $scope.updateBenefitRiskOutcomeInclusions = updateBenefitRiskOutcomeInclusions;
    $scope.updateAnalysesInclusions = updateAnalysesInclusions;
    $scope.updateModelSelection = updateModelSelection;
    $scope.goToStep2 = goToStep2;
    $scope.saveInclusions = saveInclusions;

    // init
    $scope.analysis = AnalysisResource.get($stateParams);
    $scope.alternatives = InterventionResource.query($stateParams);
    $scope.outcomes = OutcomeResource.query($stateParams);
    $scope.models = ModelResource.getConsistencyModels($stateParams);
    $scope.project = ProjectResource.get($stateParams);
    var studiesPromise = ProjectStudiesResource.query({
      projectId: $stateParams.projectId
    }).$promise;
    $scope.userId = $stateParams.userUid;

    $scope.editMode = {
      allowEditing: false
    };
    $scope.project.$promise.then(function() {
      if (UserService.isLoginUserId($scope.project.owner.id) && !$scope.analysis.archived) {
        $scope.editMode.allowEditing = true;
      }
    });

    var promises = [$scope.analysis.$promise, $scope.alternatives.$promise, $scope.outcomes.$promise, $scope.models.$promise,
      studiesPromise
    ];

    $q.all(promises).then(function(result) {
      var analysis = result[0];
      var alternatives = result[1];
      var outcomes = result[2];
      var models = _.reject(result[3], 'archived');
      var studies = result[4];

      var outcomeIds = outcomes.map(function(outcome) {
        return outcome.id;
      });

      $scope.studies = studies;
      $scope.studyArrayLength = studies.length;

      AnalysisResource.query({
        projectId: $stateParams.projectId,
        outcomeIds: outcomeIds
      }).$promise.then(function(networkMetaAnalyses) {
        networkMetaAnalyses =
          _.chain(networkMetaAnalyses)
          .reject(function(analysis) {
            return analysis.archived;
          })
          .map(_.partial(BenefitRiskService.joinModelsWithAnalysis, models))
          .map(BenefitRiskService.addModelsGroup)
          .value();
        var outcomesWithAnalyses = _.chain(outcomes)
          .map(_.partial(BenefitRiskService.buildOutcomeWithAnalyses, analysis, networkMetaAnalyses))
          .map(function(owa) {
            owa.networkMetaAnalyses = owa.networkMetaAnalyses.sort(BenefitRiskService.compareAnalysesByModels);
            return owa;
          })
          .value();

        $scope.outcomesWithAnalyses = _.map(outcomesWithAnalyses, function(outcomeWithAnalyses) {
          var outcomeWithAnalysesCopy = _.cloneDeep(outcomeWithAnalyses);
          var inclusion = _.find(analysis.benefitRiskStudyOutcomeInclusions, ['outcomeId', outcomeWithAnalysesCopy.outcome.id]);
          if (inclusion) {
            outcomeWithAnalysesCopy.dataType = 'single-study';
            if (inclusion.studyGraphUri) {
              outcomeWithAnalysesCopy.selectedStudy = _.find($scope.studies, ['studyUri', inclusion.studyGraphUri]);
            } else {
              outcomeWithAnalysesCopy.selectedStudy = {};
            }
          }
          return outcomeWithAnalysesCopy;
        });

        updateMissingAlternativesForAllOutcomes();

        updateStudyMissingStuff();
        // when view setup is completed
        checkStep1Validity();
      });

      $scope.alternatives = alternatives;

      $scope.includedAlternatives = alternatives.filter(function(alternative) {
        return analysis.interventionInclusions.find(function(includedAlternative) {
          return includedAlternative.interventionId === alternative.id;
        });
      });

      $scope.outcomes = outcomes.map(function(outcome) {
        outcome.inclusion = analysis.benefitRiskNMAOutcomeInclusions
          .concat(analysis.benefitRiskStudyOutcomeInclusions)
          .find(function(outcomeInclusion) {
            return outcomeInclusion.outcomeId === outcome.id;
          });
        outcome.isIncluded = !!outcome.inclusion;
        return outcome;
      });
    });

    function goToStep2() {
      $state.go('BenefitRiskCreationStep-2', $stateParams);
    }

    function checkStep1Validity() {
      $scope.step1AlertMessages = [];
      if (BenefitRiskService.isInvalidStudySelected($scope.outcomesWithAnalyses)) {
        $scope.step1AlertMessages.push('An invalid study is selected');
      }
      if ($scope.includedAlternatives.length < 2) {
        $scope.step1AlertMessages.push('At least two alternatives must be selected');
      }
      var numberOfSelectedOutcomes = BenefitRiskService.numberOfSelectedOutcomes($scope.outcomesWithAnalyses);
      if (numberOfSelectedOutcomes < 2) {
        $scope.step1AlertMessages.push('At least two outcomes must be selected');
      }
      var isModelWithMissingAlternatives = BenefitRiskService.isModelWithMissingAlternatives($scope.outcomesWithAnalyses);
      if (isModelWithMissingAlternatives) {
        $scope.step1AlertMessages.push('A model with missing alternatives is selected');
      }
      var isModelWithoutResults = BenefitRiskService.isModelWithoutResults($scope.outcomesWithAnalyses);
      if (isModelWithoutResults) {
        $scope.step1AlertMessages.push('A model that has not yet run is selected');
      }
      if (BenefitRiskService.hasMissingStudy($scope.outcomesWithAnalyses)) {
        $scope.step1AlertMessages.push('A study still needs to be selected');
      }
      if ($scope.overlappingInterventions.length > 0) {
        $scope.step1AlertMessages.push('There are overlapping interventions');
      }
      if (BenefitRiskService.findOverlappingOutcomes($scope.outcomesWithAnalyses).length > 0) {
        $scope.step1AlertMessages.push('There are overlapping outcomes');
      }
    }

    function updateAnalysesInclusions(changedOutcome) {
      changeModelSelection(changedOutcome);
      if (changedOutcome.selectedModel) {
        updateMissingAlternatives(changedOutcome);
      }
      saveInclusions();
    }

    function updateBenefitRiskOutcomeInclusions(changedOutcome) {
      if (!changedOutcome.outcome.isIncluded) {
        changedOutcome.selectedAnalysis = undefined;
        changedOutcome.selectedStudy = undefined;
        changedOutcome.selectedModel = undefined;
        changedOutcome.dataType = undefined;
      } else {
        if (changedOutcome.dataType === 'network') {
          changedOutcome.selectedStudy = undefined;
          if (hasSelectableAnalysis(changedOutcome)) {
            changedOutcome.selectedAnalysis = changedOutcome.networkMetaAnalyses[0];
            changeModelSelection(changedOutcome);
            if (changedOutcome.selectedModel) {
              updateMissingAlternatives(changedOutcome);
            }
          }
        } else if (changedOutcome.dataType === 'single-study') {
          changedOutcome.selectedAnalysis = undefined;
          changedOutcome.selectedModel = undefined;
          changedOutcome.selectedStudy = {};
        }
      }
      saveInclusions();
    }

    function hasSelectableAnalysis(outcome) {
      var firstAnalysis = outcome.networkMetaAnalyses[0];
      return firstAnalysis && firstAnalysis.models.length;
    }

    function changeModelSelection(changedOutcome) {
      var selectedNma = changedOutcome.selectedAnalysis;
      if (selectedNma !== undefined) {
        var primaryModel = selectedNma.models.find(function(model) {
          return model.id === selectedNma.primaryModel;
        });
        if (primaryModel) {
          changedOutcome.selectedModel = primaryModel;
        } else {
          changedOutcome.selectedModel = selectedNma.models[0];
        }
      } else {
        changedOutcome.selectedModel = undefined;
      }
    }

    function updateModelSelection(outcomeWithAnalyses) {
      if (outcomeWithAnalyses.selectedModel) {
        updateMissingAlternatives(outcomeWithAnalyses);
      }
      saveInclusions();
    }

    function updateMissingAlternatives(outcomeWithAnalyses) {
      outcomeWithAnalyses.selectedModel.missingAlternatives = BenefitRiskService.findMissingAlternatives($scope.includedAlternatives, outcomeWithAnalyses);
      outcomeWithAnalyses.selectedModel.missingAlternativesNames = _.map(outcomeWithAnalyses.selectedModel.missingAlternatives, 'name');
    }

    function updateMissingAlternativesForAllOutcomes() {
      $scope.outcomesWithAnalyses.filter(function(outcome) {
        return outcome.selectedModel;
      }).forEach(updateMissingAlternatives);
    }

    function updateStudyMissingStuff() {
      var tempStudies = SingleStudyBenefitRiskService.addMissingInterventionsToStudies($scope.studies, $scope.includedAlternatives);
      tempStudies = SingleStudyBenefitRiskService.addHasMatchedMixedTreatmentArm(tempStudies, $scope.includedAlternatives);
      $scope.studies = SingleStudyBenefitRiskService.addOverlappingInterventionsToStudies(tempStudies, $scope.includedAlternatives);
      $scope.overlappingInterventions = BenefitRiskService.findOverlappingInterventions($scope.studies);
      _.forEach($scope.outcomesWithAnalyses, function(outcomeWithAnalyses) {
        if (outcomeWithAnalyses.selectedStudy) {
          outcomeWithAnalyses.selectedStudy = _.find($scope.studies, ['studyUri', outcomeWithAnalyses.selectedStudy.studyUri]);
        }
      });
    }

    function addedAlternative(alternative) {
      $scope.includedAlternatives.push(alternative);
      updateAlternatives();
    }

    function removedAlternative(alternative) {
      $scope.includedAlternatives.splice($scope.includedAlternatives.indexOf(alternative), 1);
      updateAlternatives();
    }

    function updateAlternatives() {
      updateMissingAlternativesForAllOutcomes();
      updateStudyMissingStuff();
      var saveCommand = analysisToSaveCommand($scope.analysis);
      AnalysisResource.save(saveCommand);
      checkStep1Validity();
    }

    function analysisToSaveCommand(analysis) {
      var analysisToSave = angular.copy(analysis);
      analysisToSave.interventionInclusions = $scope.includedAlternatives.map(function(intervention) {
        return {
          interventionId: intervention.id,
          analysisId: analysisToSave.id
        };
      });
      return {
        id: analysis.id,
        projectId: analysis.projectId,
        analysis: analysisToSave
      };
    }

    function saveInclusions() {
      $scope.analysis.benefitRiskNMAOutcomeInclusions = $scope.outcomesWithAnalyses.filter(function(outcomeWithAnalyses) {
        return outcomeWithAnalyses.outcome.isIncluded && outcomeWithAnalyses.dataType === 'network';
      }).map(function(outcomeWithAnalyses) {
        return {
          analysisId: $scope.analysis.id,
          outcomeId: outcomeWithAnalyses.outcome.id,
          networkMetaAnalysisId: outcomeWithAnalyses.selectedAnalysis.id,
          modelId: outcomeWithAnalyses.selectedModel.id
        };
      });
      $scope.analysis.benefitRiskStudyOutcomeInclusions = $scope.outcomesWithAnalyses.filter(function(outcomeWithAnalyses) {
        return outcomeWithAnalyses.outcome.isIncluded && outcomeWithAnalyses.dataType === 'single-study';
      }).map(function(outcomeWithAnalyses) {
        return {
          analysisId: $scope.analysis.id,
          outcomeId: outcomeWithAnalyses.outcome.id,
          studyGraphUri: outcomeWithAnalyses.selectedStudy ? outcomeWithAnalyses.selectedStudy.studyUri : undefined 
        };
      });
      checkStep1Validity();
      updateStudyMissingStuff();
      var saveCommand = analysisToSaveCommand($scope.analysis);
      AnalysisResource.save(saveCommand);
    }

  };
  return dependencies.concat(BenefitRiskStep1Controller);
});
