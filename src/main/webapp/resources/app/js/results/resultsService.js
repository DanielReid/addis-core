'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [
    'StudyService',
    'RdfListService',
    'UUIDService',
    'ARM_LEVEL_TYPE',
    'CONTRAST_TYPE',
    'ONTOLOGY_BASE',
    'VARIABLE_TYPES',
    'VARIABLE_TYPE_DETAILS'
  ];
  var ResultsService = function(
    StudyService,
    RdfListService,
    UUIDService,
    ARM_LEVEL_TYPE,
    CONTRAST_TYPE,
    ONTOLOGY_BASE,
    VARIABLE_TYPES,
    VARIABLE_TYPE_DETAILS
  ) {

    function getVariableDetails(variableTypeUri, armOrContrast) {
      armOrContrast = armOrContrast ? armOrContrast : ARM_LEVEL_TYPE;
      var uri = buildVariableUri(variableTypeUri);
      var details = VARIABLE_TYPE_DETAILS[armOrContrast];
      return _.find(details, ['uri', uri]);
    }

    function buildVariableUri(variableTypeUri) {
      if (!_.startsWith(variableTypeUri, ONTOLOGY_BASE)) {
        return _.replace(variableTypeUri, 'ontology:', ONTOLOGY_BASE);
      }
      return variableTypeUri;
    }

    function updateValue(row, inputColumn) {
      var inputColumnVariableDetails = getVariableDetails(inputColumn.resultProperty, inputColumn.armOrContrast);
      return StudyService.getJsonGraph().then(function(graph) {
        if (!row.uri) {
          return createValueBranch(row, inputColumn, inputColumnVariableDetails.type, graph);
        } else {
          return updateValueBranch(row, inputColumn, inputColumnVariableDetails.type, graph);
        }
      });
    }

    function createValueBranch(row, inputColumn, columnType, graph) {
      if (inputColumn.value !== null && inputColumn.value !== undefined) {
        var addItem = {
          '@id': 'http://trials.drugis.org/instances/' + UUIDService.generate(),
          of_group: row.group.armURI || row.group.groupUri,
          of_moment: row.measurementMoment.uri,
          of_outcome: row.variable.uri,
          arm_or_contrast: inputColumn.armOrContrast ? inputColumn.armOrContrast : ARM_LEVEL_TYPE
        };
        addItem[columnType] = inputColumn.value;
        StudyService.saveJsonGraph(graph.concat(addItem));
        return addItem['@id'];
      } else {
        return undefined;
      }
    }

    function updateValueBranch(row, inputColumn, columnType, graph) {
      var editItem = _.remove(graph, function(node) {
        return row.uri === node['@id'];
      })[0];

      if (inputColumn.value === null) {
        delete editItem[columnType];
      } else {
        editItem[columnType] = inputColumn.value;
      }

      if (!isEmptyResult(editItem, row.variable.armOrContrast)) {
        graph.push(editItem);
      } else {
        delete row.uri;
      }
      StudyService.saveJsonGraph(graph);
      return row.uri;
    }

    function updateCategoricalValue(row, inputColumn) {
      return StudyService.getJsonGraph().then(function(graph) {
        if (!row.uri) {
          return createCategoricalBranch(row, inputColumn, graph);
        } else {
          return updateCategoricalBranch(row, inputColumn, graph);
        }
      });
    }

    function updateCategoricalBranch(row, inputColumn, graph) {
      var editItem = _.remove(graph, function(node) {
        return row.uri === node['@id'];
      })[0];

      var countItem = _.find(editItem.category_count, function(countItem) {
        return countItem.category === inputColumn.resultProperty['@id'];
      });
      if (countItem) {
        if (inputColumn.value === null) {
          editItem.category_count = _.reject(editItem.category_count, function(count) {
            return count.category === inputColumn.resultProperty['@id'];
          });
        } else {
          countItem.count = inputColumn.value;
        }
      } else {
        countItem = {
          count: inputColumn.value,
          category: inputColumn.resultProperty['@id']
        };
        editItem.category_count.push(countItem);
      }

      if (!isEmptyCategoricalResult(editItem)) {
        graph.push(editItem);
      } else {
        delete row.uri;
      }
      StudyService.saveJsonGraph(graph);
      return row.uri;
    }

    function createCategoricalBranch(row, inputColumn, graph) {
      if (inputColumn.value !== null && inputColumn.value !== undefined) {
        var addItem = {
          '@id': 'http://trials.drugis.org/instances/' + UUIDService.generate(),
          of_group: row.group.armURI || row.group.groupUri,
          of_moment: row.measurementMoment.uri,
          of_outcome: row.variable.uri,
          category_count: [{
            count: inputColumn.value,
            category: inputColumn.resultProperty['@id']
          }]
        };
        StudyService.saveJsonGraph(graph.concat(addItem));
        return addItem['@id'];
      } else {
        return undefined;
      }
    }

    function updateResultValue(row, inputColumn) {
      if (!inputColumn.isCategory) {
        return updateValue(row, inputColumn);
      } else {
        return updateCategoricalValue(row, inputColumn);
      }
    }

    function isEmptyCategoricalResult(item) {
      return !_.some(item.category_count, function(categoryItem) {
        return categoryItem.count !== undefined;
      });
    }

    function isEmptyResult(item, armOrContrast) {
      return !_.some(VARIABLE_TYPES[armOrContrast], function(type) {
        return item[type] !== undefined;
      });
    }

    function isResultForVariable(variableUri, item) {
      return isResult(item) && variableUri === item.of_outcome;
    }

    function isResultForNonConformantMeasurementOfOutcome(variableUri, item) {
      return isNonConformantMeasurementResult(item) && variableUri === item.of_outcome;
    }

    function isResultForNonConformantMeasurementOfGroup(groupUri, item) {
      return isNonConformantMeasurementResult(item) && groupUri === item.of_group;
    }

    function isResultForArm(armUri, item) {
      return isResult(item) && armUri === item.of_group;
    }

    function isResultForOutcome(outcomeUri, item) {
      return isResult(item) && outcomeUri === item.of_outcome;
    }

    function isResultForMeasurementMoment(measurementMomentUri, item) {
      return isResult(item) && measurementMomentUri === item.of_moment;
    }

    function isStudyNode(node) {
      return node['@type'] === 'ontology:Study';
    }

    function isResult(node) {
      return node.of_outcome && node.of_group && node.of_moment;
    }

    function isNonConformantMeasurementResult(node) {
      return node.comment && node.of_outcome && node.of_group && !node.of_moment;
    }

    function isMoment(node) {
      return node['@type'] === 'ontology:MeasurementMoment';
    }

    function hasValues(node) {
      if (!node.category_count) {
        return _.keys(_.pick(node, VARIABLE_TYPES[getArmOrContrast(node)])).length > 0;
      } else {
        return node.category_count.length && _.find(node.category_count, function(countNode) {
          return countNode.count !== null && countNode.count !== undefined;
        });
      }
    }

    function cleanupMeasurements() {
      return StudyService.getJsonGraph().then(function(graph) {
        // first get all the info we need
        var study = _.find(graph, isStudyNode);
        var hasArmMap = createHasPropertyByIdMap(study.has_arm);
        var isMomentMap = createHasPropertyByIdMap(_.filter(graph, isMoment));
        var outcomeMap = _.keyBy(study.has_outcome, '@id');
        var hasGroupMap = createHasPropertyByIdMap(study.has_group);
        if (study.has_included_population) {
          hasGroupMap[study.has_included_population[0]['@id']] = true;
        }

        var measurementsForOutcomes = getMeasurementsForOutcomes(study);
        var filteredGraph = removeNoLongerMeasuredProperties(graph, outcomeMap, study);

        filteredGraph = _.filter(filteredGraph, function(node) {
          if (isResult(node)) {
            return (hasArmMap[node.of_group] || hasGroupMap[node.of_group]) &&
              isMomentMap[node.of_moment] &&
              outcomeMap[node.of_outcome] &&
              measurementsForOutcomes[node.of_moment] &&
              hasValues(node);
          } else {
            return true;
          }
        });
        return StudyService.saveJsonGraph(filteredGraph);
      });
    }

    function createHasPropertyByIdMap(propertyList) {
      return _(propertyList)
        .keyBy('@id')
        .mapValues(function() {
          return true;
        })
        .value();
    }

    function getMeasurementsForOutcomes(study) {
      return _.reduce(study.has_outcome, function(accum, outcome) {
        var measurementMomentUris;
        if (!Array.isArray(outcome.is_measured_at)) {
          accum[outcome.is_measured_at] = true;
        } else {
          measurementMomentUris = outcome.is_measured_at || [];
          _.forEach(measurementMomentUris, function(measurementMomentUri) {
            accum[measurementMomentUri] = true;
          });
        }
        return accum;
      }, {});
    }

    function removeNoLongerMeasuredProperties(graph, outcomeMap, study) {
      return _.map(graph, function(node) {
        if (isResult(node) && outcomeMap[node.of_outcome]) {
          if (node.category_count) {
            var categoryIds = _.reduce(study.has_outcome, function(accum, outcome) {
              var categories = RdfListService.flattenList(outcome.of_variable[0].categoryList);
              return accum.concat(_.map(categories, '@id'));
            }, []);
            node.category_count = _.filter(node.category_count, function(countObject) {
              return _.includes(categoryIds, countObject.category);
            });
          } else {
            var resultProperties = getResultPropertiesFor(node);
            var missingProperties = _.filter(resultProperties, function(resultProperty) {
              return !_.includes(outcomeMap[node.of_outcome].has_result_property, resultProperty.uri);
            });
            return _.omit(node, _.map(missingProperties, 'type'));
          }
          return node;
        } else {
          return node;
        }
      });
    }

    function getResultPropertiesFor(node) {
      var variableTypes = VARIABLE_TYPES[getArmOrContrast(node)];
      var resultProperties = _.keys(_.pick(node, variableTypes));
      return _.map(resultProperties, function(resultProperty) {
        return VARIABLE_TYPE_DETAILS[getArmOrContrast(node)][resultProperty];
      });

    }

    function getArmOrContrast(node) {
      return node.arm_or_contrast ? node.arm_or_contrast : ARM_LEVEL_TYPE;
    }

    function setToMeasurementMoment(measurementMomentUri, measurementInstanceList) {
      return StudyService.getJsonGraph().then(function(graph) {
        _.forEach(graph, function(node) {
          if (_.includes(measurementInstanceList, node['@id'])) {
            node.of_moment = measurementMomentUri;
            delete node.comment;
          }
        });
        return StudyService.saveJsonGraph(graph);
      });
    }

    function moveMeasurementMoment(fromUri, toUri, variableUri, rowLabel) {
      return StudyService.getJsonGraph().then(function(graph) {
        var updatedGraph;
        if (!toUri) {
          updatedGraph = _.map(graph, function(node) {
            if (node.of_moment === fromUri && node.of_outcome === variableUri) {
              delete node.of_moment;
              node.comment = rowLabel;
            }
            return node;
          });
        } else {
          // first delete all old measurements at target coordinates
          var filteredGraph = _.reject(graph, function(node) {
            return node.of_moment === toUri && node.of_outcome === variableUri;
          });
          updatedGraph = _.map(filteredGraph, function(node) {
            if (node.of_moment === fromUri && node.of_outcome === variableUri) {
              node.of_moment = toUri;
            }
            return node;
          });
        }
        return StudyService.saveJsonGraph(updatedGraph);

      });
    }

    function isExistingMeasurement(measurementMomentUri, measurementInstanceList) {
      var nonConformantMeasurementInstance = measurementInstanceList[0];
      return StudyService.getJsonGraph().then(function(graph) {

        var nonConformantMeasurement = _.find(graph, function(node) {
          return node['@id'] === nonConformantMeasurementInstance;
        });

        return !!_.find(graph, function(node) {
          return isResult(node) &&
            node.of_moment === measurementMomentUri &&
            nonConformantMeasurement.of_group === node.of_group &&
            nonConformantMeasurement.of_outcome === node.of_outcome;
        });
      });
    }

    function _queryResults(uri, typeFunction) {
      return StudyService.getJsonGraph().then(function(graph) {
        var resultJsonItems = graph.filter(typeFunction.bind(this, uri));
        return _(resultJsonItems)
          .map(toFrontend)
          .flatten()
          .value();
      });
    }

    function queryResults(variableUri) {
      return _queryResults(variableUri, isResultForVariable);
    }

    function toFrontend(backEndItem) {
      var baseItem = {
        instance: backEndItem['@id'],
        armUri: backEndItem.of_group,
        momentUri: backEndItem.of_moment,
        outcomeUri: backEndItem.of_outcome,
        armOrContrast: backEndItem.arm_or_contrast || ARM_LEVEL_TYPE
      };
      if (isNonConformantMeasurementResult(backEndItem)) {
        baseItem.comment = backEndItem.comment;
      }

      var valueItems = createValueItems(baseItem, backEndItem);
      var categoryItems = createCategoryItems(baseItem, backEndItem);
      return valueItems.concat(categoryItems);
    }

    function createCategoryItems(baseItem, backEndItem) {
      if (backEndItem.category_count) {
        return _.map(backEndItem.category_count, function(categoryCount) {
          return createCategoryItem(baseItem, categoryCount);
        });
      } else {
        return [];
      }
    }

    function createValueItems(baseItem, backEndItem) {
      return _(VARIABLE_TYPES[baseItem.armOrContrast])
        .map(function(variableType) {
          if (backEndItem[variableType] !== undefined) {
            return createValueItem(baseItem, backEndItem, variableType);
          }
        })
        .compact()
        .value();
    }

    function createValueItem(baseItem, backEndItem, type) {
      var valueItem = angular.copy(baseItem);
      valueItem.result_property = type;
      valueItem.value = backEndItem[type];
      return valueItem;
    }

    function createCategoryItem(baseItem, categoryItem) {
      var valueItem = angular.copy(baseItem);
      valueItem.isCategorical = true;
      valueItem.result_property = categoryItem.category && categoryItem.category.label ? categoryItem.label : categoryItem;
      valueItem.value = categoryItem.count;
      return valueItem;
    }

    function queryResultsByGroup(armUri) {
      return _queryResults(armUri, isResultForArm);
    }

    function queryResultsByOutcome(outcomeUri) {
      return _queryResults(outcomeUri, isResultForOutcome);
    }

    function queryResultsByMeasurementMoment(measurementMomentUri) {
      return _queryResults(measurementMomentUri, isResultForMeasurementMoment);
    }

    function queryNonConformantMeasurementsByOutcomeUri(outcomeUri) {
      return _queryResults(outcomeUri, isResultForNonConformantMeasurementOfOutcome);
    }

    function queryNonConformantMeasurementsByGroupUri(groupUri) {
      return _queryResults(groupUri, isResultForNonConformantMeasurementOfGroup);
    }

    return {
      updateResultValue: updateResultValue,
      queryResults: queryResults,
      queryResultsByGroup: queryResultsByGroup,
      queryResultsByOutcome: queryResultsByOutcome,
      queryResultsByMeasurementMoment: queryResultsByMeasurementMoment,
      queryNonConformantMeasurementsByOutcomeUri: queryNonConformantMeasurementsByOutcomeUri,
      queryNonConformantMeasurementsByGroupUri: queryNonConformantMeasurementsByGroupUri,
      cleanupMeasurements: cleanupMeasurements,
      setToMeasurementMoment: setToMeasurementMoment,
      moveMeasurementMoment: moveMeasurementMoment,
      isExistingMeasurement: isExistingMeasurement,
      isStudyNode: isStudyNode,
      getVariableDetails: getVariableDetails
    };
  };
  return dependencies.concat(ResultsService);
});
