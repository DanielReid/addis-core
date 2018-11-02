'use strict';

define(['angular'], function(angular) {
  var INTEGER_TYPE = '<http://www.w3.org/2001/XMLSchema#integer>';
  var DOUBLE_TYPE = '<http://www.w3.org/2001/XMLSchema#double>';
  var BOOLEAN_TYPE = '<http://www.w3.org/2001/XMLSchema#boolean>';
  var ONTOLOGY_BASE = 'http://trials.drugis.org/ontology#';
  var ARM_LEVEL_TYPE = 'ontology:arm_level_data';
  var CONTRAST_TYPE = 'ontology:contrast_data';
  var DICHOTOMOUS_TYPE = 'ontology:dichotomous';
  var CONTINUOUS_TYPE = 'ontology:continuous';
  var SURVIVAL_TYPE = 'ontology:survival';

  var ARM_VARIABLE_TYPES = [
    'sample_size',
    'mean',
    'median',
    'geometric_mean',
    'log_mean',
    'least_squares_mean',
    'quantile_0.05',
    'quantile_0.95',
    'quantile_0.025',
    'quantile_0.975',
    'min',
    'max',
    'geometric_coefficient_of_variation',
    'first_quartile',
    'third_quartile',
    'standard_deviation',
    'standard_error',
    'count',
    'event_count',
    'percentage',
    'proportion',
    'exposure',
    'hazard_ratio'
  ];

  var CONTRAST_VARIABLE_TYPES = [
    'standard_error',
    'hazard_ratio',
    'log_odds_ratio',
    'log_risk_ratio',
    'mean_difference',
    'standardized_mean_difference',
    'log_hazard_ratio',
    'confidence_interval_lowerbound',
    'confidence_interval_upperbound'
  ];

  var VARIABLE_TYPES = {
    'ontology:arm_level_data': ARM_VARIABLE_TYPES,
    'ontology:contrast_data': CONTRAST_VARIABLE_TYPES
  };

  var ARM_VARIABLE_TYPE_DETAILS = {
    sample_size: {
      type: 'sample_size',
      label: 'N',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#sample_size',
      dataType: INTEGER_TYPE,
      variableTypes: [CONTINUOUS_TYPE, DICHOTOMOUS_TYPE],
      category: 'Sample size',
      lexiconKey: 'sample-size',
      analysisReady: true,
      isAlwaysPositive: true
    },
    mean: {
      type: 'mean',
      label: 'mean',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#mean',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Central tendency',
      lexiconKey: 'mean',
      analysisReady: true
    },
    median: {
      type: 'median',
      label: 'median',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#median',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Central tendency',
      lexiconKey: 'median',
      analysisReady: false
    },
    geometric_mean: {
      type: 'geometric_mean',
      label: 'geometric mean',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#geometric_mean',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Central tendency',
      lexiconKey: 'geometric-mean',
      analysisReady: false
    },
    log_mean: {
      type: 'log_mean',
      label: 'log mean',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#log_mean',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Central tendency',
      lexiconKey: 'log-mean',
      analysisReady: false
    },
    least_squares_mean: {
      type: 'least_squares_mean',
      label: 'least squares mean',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#least_squares_mean',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Central tendency',
      lexiconKey: 'least-squares-mean',
      analysisReady: false
    },
    hazard_ratio: {
      type: 'hazard_ratio',
      label: 'hazard ratio',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#hazard_ratio',
      dataType: DOUBLE_TYPE,
      variableTypes: [SURVIVAL_TYPE],
      lexiconKey: 'hazard-ratio',
      analysisReady: false
    },
    'quantile_0.05': {
      type: 'quantile_0.05',
      label: '5% quantile',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#quantile_0.05',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Quantiles',
      lexiconKey: 'quantile-0.05',
      analysisReady: false
    },
    'quantile_0.95': {
      type: 'quantile_0.95',
      label: '95% quantile',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#quantile_0.95',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Quantiles',
      lexiconKey: 'quantile-0.95',
      analysisReady: false
    },
    'quantile_0.025': {
      type: 'quantile_0.025',
      label: '2.5% quantile',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#quantile_0.025',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE, SURVIVAL_TYPE],
      category: 'Quantiles',
      lexiconKey: 'quantile-0.025',
      analysisReady: false
    },
    'quantile_0.975': {
      type: 'quantile_0.975',
      label: '97.5% quantile',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#quantile_0.975',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE, SURVIVAL_TYPE],
      category: 'Quantiles',
      lexiconKey: 'quantile-0.975',
      analysisReady: false
    },
    min: {
      type: 'min',
      label: 'min',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#min',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Dispersion',
      lexiconKey: 'min',
      analysisReady: false
    },
    max: {
      type: 'max',
      label: 'max',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#max',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Dispersion',
      lexiconKey: 'max',
      analysisReady: false
    },
    geometric_coefficient_of_variation: {
      type: 'geometric_coefficient_of_variation',
      label: 'geometric coefficient of variation',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#geometric_coefficient_of_variation',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Dispersion',
      lexiconKey: 'geometric-coefficient-of-variation',
      analysisReady: false
    },
    first_quartile: {
      type: 'first_quartile',
      label: 'first quartile',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#first_quartile',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Quantiles',
      lexiconKey: 'first-quartile',
      analysisReady: false
    },
    third_quartile: {
      type: 'third_quartile',
      label: 'third quartile',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#third_quartile',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Quantiles',
      lexiconKey: 'third-quartile',
      analysisReady: false
    },
    standard_deviation: {
      type: 'standard_deviation',
      label: 'standard deviation',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#standard_deviation',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Dispersion',
      lexiconKey: 'standard-deviation',
      analysisReady: true,
      isAlwaysPositive: true
    },
    standard_error: {
      type: 'standard_error',
      label: 'standard error',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#standard_error',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      category: 'Dispersion',
      lexiconKey: 'standard-error',
      analysisReady: true,
      isAlwaysPositive: true
    },
    event_count: {
      type: 'event_count',
      label: 'number of events',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#event_count',
      dataType: INTEGER_TYPE,
      variableTypes: [DICHOTOMOUS_TYPE],
      lexiconKey: 'event-count',
      analysisReady: false,
      isAlwaysPositive: true
    },
    count: {
      type: 'count',
      label: 'subjects with event',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#count',
      dataType: INTEGER_TYPE,
      variableTypes: [DICHOTOMOUS_TYPE, SURVIVAL_TYPE],
      lexiconKey: 'count',
      analysisReady: true,
      isAlwaysPositive: true
    },
    percentage: {
      type: 'percentage',
      label: 'percentage with event',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#percentage',
      dataType: DOUBLE_TYPE,
      variableTypes: [DICHOTOMOUS_TYPE],
      lexiconKey: 'percentage',
      analysisReady: false,
      isAlwaysPositive: true
    },
    proportion: {
      type: 'proportion',
      label: 'proportion with event',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#proportion',
      dataType: DOUBLE_TYPE,
      variableTypes: [DICHOTOMOUS_TYPE],
      lexiconKey: 'proportion',
      analysisReady: false,
      isAlwaysPositive: true
    },
    exposure: {
      type: 'exposure',
      label: 'total observation time',
      armOrContrast: ARM_LEVEL_TYPE,
      uri: 'http://trials.drugis.org/ontology#exposure',
      dataType: DOUBLE_TYPE,
      variableTypes: [SURVIVAL_TYPE],
      lexiconKey: 'exposure',
      analysisReady: true
    }
  };

  var TIME_SCALE_OPTIONS = [{
    label: 'Days',
    duration: 'P1D'
  }, {
    label: 'Weeks',
    duration: 'P1W'
  }, {
    label: 'Months',
    duration: 'P1M'
  }, {
    label: 'Years',
    duration: 'P1Y'
  }];

  var CONTRAST_VARIABLE_TYPE_DETAILS = {
    log_odds_ratio: {
      type: 'log_odds_ratio',
      label: 'log odds ratio',
      armOrContrast: CONTRAST_TYPE,
      isLog: true,
      category: 'Central tendency',
      uri: 'http://trials.drugis.org/ontology#odds_ratio',
      dataType: DOUBLE_TYPE,
      variableTypes: [DICHOTOMOUS_TYPE],
      lexiconKey: 'odds-ratio',
      analysisReady: false
    },
    log_risk_ratio: {
      type: 'log_risk_ratio',
      label: 'log risk ratio',
      armOrContrast: CONTRAST_TYPE,
      isLog: true,
      category: 'Central tendency',
      uri: 'http://trials.drugis.org/ontology#risk_ratio',
      dataType: DOUBLE_TYPE,
      variableTypes: [DICHOTOMOUS_TYPE],
      lexiconKey: 'risk-ratio',
      analysisReady: false
    },
    mean_difference: {
      type: 'mean_difference',
      label: 'mean difference',
      armOrContrast: CONTRAST_TYPE,
      category: 'Central tendency',
      uri: 'http://trials.drugis.org/ontology#mean_difference',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      lexiconKey: 'mean-difference',
      analysisReady: false
    },
    standardized_mean_difference: {
      type: 'standardized_mean_difference',
      label: 'standardized mean difference',
      armOrContrast: CONTRAST_TYPE,
      category: 'Central tendency',
      uri: 'http://trials.drugis.org/ontology#standardized_mean_difference',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE],
      lexiconKey: 'standardized-mean-difference',
      analysisReady: false
    },
    log_hazard_ratio: {
      type: 'log_hazard_ratio',
      label: 'log hazard ratio',
      armOrContrast: CONTRAST_TYPE,
      isLog: true,
      category: 'Central tendency',
      uri: 'http://trials.drugis.org/ontology#hazard_ratio',
      dataType: DOUBLE_TYPE,
      variableTypes: [SURVIVAL_TYPE],
      lexiconKey: 'hazard-ratio',
      analysisReady: false
    },
    standard_error: {
      type: 'standard_error',
      label: 'standard error',
      armOrContrast: CONTRAST_TYPE,
      uri: 'http://trials.drugis.org/ontology#standard_error',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE, DICHOTOMOUS_TYPE, SURVIVAL_TYPE],
      category: 'Dispersion',
      lexiconKey: 'standard-error',
      analysisReady: true,
      isAlwaysPositive: true
    },
    confidence_interval_width: {
      type: 'confidence_interval',
      label: 'confidence interval',
      armOrContrast: CONTRAST_TYPE,
      uri: 'http://trials.drugis.org/ontology#confidence_interval_width',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE, DICHOTOMOUS_TYPE, SURVIVAL_TYPE],
      category: 'Dispersion',
      lexiconKey: 'confidence-interval',
      analysisReady: false,
      isAlwaysPositive: true
    },
    confidence_interval_lowerbound: {
      type: 'confidence_interval_lowerbound',
      label: 'confidence interval lowerbound',
      armOrContrast: CONTRAST_TYPE,
      uri: 'http://trials.drugis.org/ontology#confidence_interval_lowerbound',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE, DICHOTOMOUS_TYPE, SURVIVAL_TYPE],
      category: 'Dispersion',
      lexiconKey: 'confidence-interval',
      analysisReady: false,
      hiddenSelection: true
    },
    confidence_interval_upperbound: {
      type: 'confidence_interval_upperbound',
      label: 'confidence interval upperbound',
      armOrContrast: CONTRAST_TYPE,
      uri: 'http://trials.drugis.org/ontology#confidence_interval_upperbound',
      dataType: DOUBLE_TYPE,
      variableTypes: [CONTINUOUS_TYPE, DICHOTOMOUS_TYPE, SURVIVAL_TYPE],
      category: 'Dispersion',
      lexiconKey: 'confidence-interval',
      analysisReady: false,
      hiddenSelection: true
    }
  };

  var VARIABLE_TYPE_DETAILS = {
    'ontology:arm_level_data': ARM_VARIABLE_TYPE_DETAILS,
    'ontology:contrast_data': CONTRAST_VARIABLE_TYPE_DETAILS
  };

  var DEFAULT_ARM_RESULT_PROPERTIES = {
    'ontology:continuous': [
      ARM_VARIABLE_TYPE_DETAILS.sample_size,
      ARM_VARIABLE_TYPE_DETAILS.mean,
      ARM_VARIABLE_TYPE_DETAILS.standard_deviation
    ],
    'ontology:dichotomous': [
      ARM_VARIABLE_TYPE_DETAILS.sample_size,
      ARM_VARIABLE_TYPE_DETAILS.count
    ],
    'ontology:categorical': [],
    'ontology:survival': [
      ARM_VARIABLE_TYPE_DETAILS.count,
      ARM_VARIABLE_TYPE_DETAILS.exposure
    ]
  };

  var DEFAULT_CONTRAST_RESULT_PROPERTIES = {
    'ontology:dichotomous': [
      CONTRAST_VARIABLE_TYPE_DETAILS.log_odds_ratio,
      CONTRAST_VARIABLE_TYPE_DETAILS.standard_error
    ],
    'ontology:continuous': [
      CONTRAST_VARIABLE_TYPE_DETAILS.mean_difference,
      CONTRAST_VARIABLE_TYPE_DETAILS.standard_error
    ],
    'ontology:categorical': [],
    'ontology:survival': [
      CONTRAST_VARIABLE_TYPE_DETAILS.log_hazard_ratio,
      CONTRAST_VARIABLE_TYPE_DETAILS.standard_error
    ]
  };

  var DEFAULT_RESULT_PROPERTIES = {
    'ontology:arm_level_data': DEFAULT_ARM_RESULT_PROPERTIES,
    'ontology:contrast_data': DEFAULT_CONTRAST_RESULT_PROPERTIES
  };

  return angular.module('addis.resultsConstants', [])
    .constant('DOUBLE_TYPE', DOUBLE_TYPE)
    .constant('INTEGER_TYPE', INTEGER_TYPE)
    .constant('BOOLEAN_TYPE', BOOLEAN_TYPE)

    .constant('ONTOLOGY_BASE', ONTOLOGY_BASE)
    .constant('ARM_LEVEL_TYPE', ARM_LEVEL_TYPE)

    .constant('DICHOTOMOUS_TYPE', DICHOTOMOUS_TYPE)
    .constant('CONTINUOUS_TYPE', CONTINUOUS_TYPE)
    .constant('SURVIVAL_TYPE', SURVIVAL_TYPE)

    .constant('VARIABLE_TYPES', VARIABLE_TYPES)
    .constant('VARIABLE_TYPE_DETAILS', VARIABLE_TYPE_DETAILS)
    .constant('DEFAULT_RESULT_PROPERTIES', DEFAULT_RESULT_PROPERTIES)
    .constant('ARM_VARIABLE_TYPES', ARM_VARIABLE_TYPES)
    .constant('ARM_VARIABLE_TYPE_DETAILS', ARM_VARIABLE_TYPE_DETAILS)
    .constant('TIME_SCALE_OPTIONS', TIME_SCALE_OPTIONS)
    ;
});
