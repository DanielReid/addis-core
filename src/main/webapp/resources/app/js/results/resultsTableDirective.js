'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$q', 'ResultsTableService', 'ResultsService'];

  var resultsTableDirective = function($q, ResultsTableService, ResultsService) {
    return {
      restrict: 'E',
      templateUrl: './resultsTableDirective.html',
      scope: {
        variable: '=',
        arms: '=',
        groups: '=',
        measurementMoments: '=',
        isEditingAllowed: '='
      },
      link: function(scope) {
        // functions
        // scope.show = show;
        // scope.hide = hide;
        scope.toggle = toggle;
        scope.editMeasurementMoment = editMeasurementMoment;
        scope.checkMeasurementOverlap = checkMeasurementOverlap;
        scope.showEditMeasurementMoment = showEditMeasurementMoment;

        // init
        scope.$on('refreshResultsTable', reloadResults);
        scope.isExpanded = false;

        function reloadResults() {
          if (scope.isExpanded) {
            var resultsPromise = ResultsService.queryResults(scope.variable.uri);

            return $q.all([scope.arms, scope.measurementMoments, scope.groups, resultsPromise]).then(function(values) {
              var arms = values[0],
                measurementMoments = values[1],
                groups = values[2],
                results = values[3];
              scope.inputRows = ResultsTableService.createInputRows(scope.variable, arms, groups,
                measurementMoments, results);
              scope.inputHeaders = ResultsTableService.createHeaders(scope.variable);
              scope.measurementMomentOptions = ResultsTableService.buildMeasurementMomentOptions(scope.variable.measuredAtMoments);
              scope.measurementMomentSelections = _.reduce(scope.inputRows, function(accum, inputRow) {
                // for every inputRow, take the uri of its measurementMoment. Then get for this measurementMoment the 
                // first in its list of options available when changing the measurementMoment of this row to another
                // measurementMoment. Then store this option based on the uri of the measurement moment
                var measurementMomentUri = inputRow.measurementMoment.uri;
                accum[measurementMomentUri] = scope.measurementMomentOptions[measurementMomentUri][0];
                return accum;
              }, {});
              checkMeasurementOverlap();
              scope.isEditingMM = _.reduce(scope.measurementMoments, function(accum, measurementMoment) {
                accum[measurementMoment.uri] = false;
                return accum;
              }, {});
              scope.hasNotAnalysedProperty = _.find(scope.inputHeaders, function(header) {
                return header.lexiconKey && !header.analysisReady; // only check if not categorical
              });
            });
          }
        }

        function show() {
          scope.isExpanded = true;
          reloadResults();
        }

        function hide() {
          scope.isExpanded = false;
          delete scope.results;
        }

        function toggle() {
          if (scope.isExpanded) {
            hide();
          } else {
            show();
          }
        }

        function editMeasurementMoment(measurementMomentUri, rowLabel) {
          ResultsService.moveMeasurementMoment(measurementMomentUri,
            scope.measurementMomentSelections[measurementMomentUri].uri,
            scope.variable.uri,
            rowLabel
          ).then(function() {
            scope.$emit('refreshResults');
            scope.isEditingMM[measurementMomentUri] = false;
          });
        }

        function checkMeasurementOverlap() {
          scope.overlapMap = _.reduce(scope.measurementMomentSelections, function(accum, selection, measurementMomentUri) {
            accum[measurementMomentUri] = ResultsTableService.findOverlappingMeasurements(selection.uri, scope.inputRows);
            return accum;
          }, {});
        }

        function showEditMeasurementMoment(measurementMomentUri) {
          reloadResults().then(function() {
            scope.isEditingMM[measurementMomentUri] = true;
          });
        }
      }
    };
  };

  return dependencies.concat(resultsTableDirective);
});
