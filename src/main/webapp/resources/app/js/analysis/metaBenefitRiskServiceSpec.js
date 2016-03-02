'use strict';
define(['angular-mocks'], function(angularMocks) {
  describe('meta-benefit-risk service', function() {
    var metaBenefitRiskService;

    beforeEach(angularMocks.module('addis.analysis'));

    beforeEach(inject(function(MetaBenefitRiskService) {
      metaBenefitRiskService = MetaBenefitRiskService;
    }));

    describe('buildOutcomesWithAnalyses', function() {
      it('should build inclusions when the outcome is included', function() {
        var outcome = {
          id: 1,
          isIncluded: true
        };
        var analysis = {
          id: 7,
          mbrOutcomeInclusions: [{
            outcomeId: 1,
            networkMetaAnalysisId: 3,
            modelId: 1
          }]
        };
        var networkMetaAnalyses = [{
          id: 3,
          outcome: outcome
        }, {
          id: 5,
          outcome: outcome
        }];
        var models = [{
          id: 1
        }, {
          id: 2
        }];
        var expectedResult = {
          outcome: outcome,
          networkMetaAnalyses: [{
            id: 3,
            outcome: {
              id: 1,
              isIncluded: true
            }
          }, {
            id: 5,
            outcome: {
              id: 1,
              isIncluded: true
            }
          }],
          selectedAnalysis: {
            id: 3,
            outcome: {
              id: 1,
              isIncluded: true
            }
          },
          selectedModel: models[0]
        };

        var result = metaBenefitRiskService.buildOutcomesWithAnalyses(analysis, networkMetaAnalyses, models, outcome);

        expect(result).toEqual(expectedResult);
      });
    });

    describe('joinModelsWithAnalysis', function() {
      it('should add the models to the analyses if they belong to it', function() {
        var models = [{
          analysisId: 1
        }, {
          analysisId: 2
        }, {
          analysisId: 1
        }];
        var analysis = {
          id: 1
        };
        var result = metaBenefitRiskService.joinModelsWithAnalysis(models, analysis);
        expect(result.models).toEqual([models[0], models[2]]);
      });
    });

    describe('compareAnalysesByModels', function() {
      it('should place analyses with models before those without', function() {
        var a = {
          models: [1]
        };
        var b = {
          models: []
        };
        expect(metaBenefitRiskService.compareAnalysesByModels(a, b)).toBe(-1);
        expect(metaBenefitRiskService.compareAnalysesByModels(b, a)).toBe(1);
      });
      it('should do nothing if both analyses have models', function() {
        var a = {
          models: [1]
        };
        var b = {
          models: [1]
        };
        expect(metaBenefitRiskService.compareAnalysesByModels(a, b)).toBe(0);
        expect(metaBenefitRiskService.compareAnalysesByModels(b, a)).toBe(0);
      });
      it('should do nothing if neither analysis has a model', function() {
        var a = {
          models: []
        };
        var b = {
          models: []
        };
        expect(metaBenefitRiskService.compareAnalysesByModels(a, b)).toBe(0);
        expect(metaBenefitRiskService.compareAnalysesByModels(b, a)).toBe(0);
      });
    });
    describe('addModelsGroup', function() {
      it('should decorate the models with their group', function() {

        var result = metaBenefitRiskService.addModelsGroup({
          primaryModel: 1,
          models: [{
            id: 1
          }, {
            id: 2
          }]
        });
        expect(result).toEqual({
          primaryModel: 1,
          models: [{
            id: 1,
            group: 'Primary model'
          }, {
            id: 2,
            group: 'Other models'
          }]
        });
      });
    });
  });
});
