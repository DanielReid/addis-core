'use strict';
define(['lodash'], function(_) {
  var dependencies = ['ResultsService'];
  var ResultsTableService = function(ResultsService) {

    var CONTINUOUS_TYPE = 'ontology:continuous';
    var DICHOTOMOUS_TYPE = 'ontology:dichotomous';
    var CATEGORICAL_TYPE = 'ontology:categorical';
    var CONTRAST = 'ontology:contrast_data';

    function findResultValueByType(resultValueObjects, type) {
      var resultValueObjectFound = _.find(resultValueObjects, function(resultValueObject) {
        return resultValueObject.result_property === type;
      });

      if (resultValueObjectFound) {
        return Number(resultValueObjectFound.value);
      }
    }

    function findCategoricalResult(resultValueObjects, category) {
      var resultValueObjectFound = _.find(resultValueObjects, function(resultValueObject) {
        return resultValueObject.result_property.category === category['@id'];
      });
      if (resultValueObjectFound) {
        if (resultValueObjectFound.value === undefined) {
          return undefined;
        } else {
          return Number(resultValueObjectFound.value);
        }
      }
    }

    function createInputColumns(variable, rowValueObjects) {
      if (!variable.resultProperties) {
        if (variable.categoryList) {
          return createCategoryInputColumn(variable, rowValueObjects);
        } else {
          return [];
        }
      }
      return createNonCategoricalInputColumn(variable, rowValueObjects);
    }

    function createNonCategoricalInputColumn(variable, rowValueObjects) {
      return _.map(variable.resultProperties, function(type) {
        var details = ResultsService.getVariableDetails(type, variable.armOrContrast);
        return {
          resultProperty: type,
          valueName: details.label,
          value: findResultValueByType(rowValueObjects, details.type),
          dataType: details.dataType,
          isInValidValue: false,
          isAlwaysPositive: details.isAlwaysPositive
        };
      });
    }

    function createCategoryInputColumn(variable, rowValueObjects) {
      return _.map(variable.categoryList, function(category) {
        var resultProperty;
        var value;
        var valueName;
        if (category.label) { // new format
          resultProperty = null;
          valueName = category.label;
          value = findCategoricalResult(rowValueObjects, category);
        } else { // old format
          resultProperty = category;
          valueName = category;
          value = findResultValueByType(rowValueObjects, category);
        }
        return {
          resultProperty: category,
          valueName: category,
          value: value,
          dataType: ResultsService.INTEGER_TYPE,
          isCategory: true,
          isInValidValue: false
        };
      });
    }

    function createHeaders(variable) {
      if (!variable.resultProperties) {
        return createCategoricalHeader(variable);
      }
      return  _.map(variable.resultProperties, function(property) {
        return createHeader(property, variable);
      });
    }

    function createCategoricalHeader(variable) {
      if (!variable.categoryList) {
        return [];
      } else {
        //Categorical measurement
        if (variable.categoryList[0] && variable.categoryList[0].label) {
          return _.map(variable.categoryList, function(list) {
            return {
              'label': list.label
            };
          });
        } else {
          return variable.categoryList;
        }
      }
    }

    function createHeader(resultProperty, variable) {
      var scaleStrings = {
        P1D: ' (days)',
        P1W: ' (weeks)',
        P1M: ' (months)',
        P1Y: ' (years)'
      };
      var propertyUri = _.isString(resultProperty) ? resultProperty : resultProperty.uri;
      var propertyDetails = ResultsService.getVariableDetails(propertyUri, variable.armOrContrast);
      return {
        label: propertyDetails.label + (propertyDetails.type === 'exposure' ? scaleStrings[variable.timeScale] : ''),
        lexiconKey: propertyDetails.lexiconKey,
        analysisReady: propertyDetails.analysisReady
      };
    }

    function createInputRows(variable, arms, groups, measurementMoments, resultValuesObjects) {
      var rows = [];
      _.forEach(variable.measuredAtMoments, function(measuredAtMoment) {

        var measurementMoment = _.find(measurementMoments, function(measurementMoment) {
          return measurementMoment.uri === measuredAtMoment.uri;
        });

        _.forEach(arms, function(arm) {
          var rowValueObjects = _.filter(resultValuesObjects, function(resultValueObject) {
            return (resultValueObject.momentUri === measurementMoment.uri && resultValueObject.armUri === arm.armURI);
          });
          rows = rows.concat(createRow(variable, arm, arms.length + groups.length, measurementMoment, rowValueObjects));
        });

        _.forEach(groups, function(group) {
          var rowValueObjects = _.filter(resultValuesObjects, function(resultValueObject) {
            return (resultValueObject.momentUri === measurementMoment.uri && resultValueObject.armUri === group.groupUri);
          });
          rows = rows.concat(createRow(variable, group, arms.length + groups.length, measurementMoment, rowValueObjects));
        });
      });

      var sortedRows = sortRows(rows);
      return sortedRows;
    }

    function createRow(variable, group, numberOfGroups, measurementMoment, rowValueObjects) {
      var row = {
        variable: variable,
        group: group,
        measurementMoment: measurementMoment,
        numberOfGroups: numberOfGroups,
        inputColumns: createInputColumns(variable, rowValueObjects)
      };

      // if this row has any values set we need to save the instance uri on the row to use for update or delete
      if (rowValueObjects && rowValueObjects.length > 0) {
        row.uri = rowValueObjects[0].instance;
      }

      return row;
    }

    function sortRows(rows) {
      return rows.sort(function(row1, row2) {
        if (row1.measurementMoment.label.localeCompare(row2.measurementMoment.label) !== 0) {
          return row1.measurementMoment.label.localeCompare(row2.measurementMoment.label);
        }
        if (row1.group.label === 'Overall population') {
          return 1;
        }
        if (row2.group.label === 'Overall population') {
          return -1;
        }
        return row1.group.label.localeCompare(row2.group.label);
      });
    }

    function isValidValue(inputColumn) {
      if (inputColumn.value === undefined) {
        return false;
      }
      if (inputColumn.value) {
        if (inputColumn.dataType === ResultsService.INTEGER_TYPE) {
          return Number.isInteger(inputColumn.value) && (!inputColumn.isAlwaysPositive || inputColumn.value >= 0);
        } else if (inputColumn.dataType === ResultsService.DOUBLE_TYPE) {
          return !isNaN(filterFloat(inputColumn.value)) && (!inputColumn.isAlwaysPositive || inputColumn.value >= 0);
        }
      } else {
        return true;
      }
    }

    function filterFloat(value) {
      if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
        return Number(value);
      }
      return NaN;
    }

    function buildMeasurementMomentOptions(measurementMoments) {
      //Builds the list of options per measurement moment, used when changing the mm of data to unassigned or another mm
      return _.reduce(measurementMoments, function(accum, measurementMoment) {
        var options = _.reject(measurementMoments, ['uri', measurementMoment.uri])
          .sort(function(mm1, mm2) {
            return mm1.label.localeCompare(mm2.label);
          })
          .concat({
            label: 'Unassign'
          });
        accum[measurementMoment.uri] = options;
        return accum;
      }, {});
    }

    function findOverlappingMeasurements(targetMMUri, inputRows) {
      return _.find(inputRows, function(inputRow) {
        return targetMMUri === inputRow.measurementMoment.uri && _.find(inputRow.inputColumns, function(inputColumn) {
          return inputColumn.value !== undefined;
        });
      });
    }

    return {
      createInputRows: createInputRows,
      createHeaders: createHeaders,
      isValidValue: isValidValue,
      createInputColumns: createInputColumns,
      buildMeasurementMomentOptions: buildMeasurementMomentOptions,
      findOverlappingMeasurements: findOverlappingMeasurements,
      CONTINUOUS_TYPE: CONTINUOUS_TYPE,
      DICHOTOMOUS_TYPE: DICHOTOMOUS_TYPE,
      CATEGORICAL_TYPE: CATEGORICAL_TYPE
    };
  };
  return dependencies.concat(ResultsTableService);
});
