'use strict';
define(function(require) {
  var angular = require('angular');
  return angular.module('addis.directives', [])
    .directive('sessionExpiredDirective', require('directives/sessionExpiredDirective'))
    .directive('addisToast', require('directives/addisToastDirective'))
    .directive('addisToastMessage', require('directives/addisToastMessageDirective'));
});