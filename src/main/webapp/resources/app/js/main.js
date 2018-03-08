'use strict';

require.config({
  paths: {
    'angular': 'bower_components/angular/angular',
    'angular-cookies': 'bower_components/angular-cookies/angular-cookies.min',
    'angular-md5': 'bower_components/angular-md5/angular-md5.min',
    'angular-patavi-client': 'bower_components/angular-patavi-client/patavi',
    'angular-resource': 'bower_components/angular-resource/angular-resource.min',
    'angular-ui-router': 'bower_components/angular-ui-router/release/angular-ui-router.min',
    'angular-select': 'bower_components/angular-ui-select/dist/select.min',
    'angular-touch': 'bower_components/angular-touch/angular-touch',
    'angularanimate': 'bower_components/angular-animate/angular-animate.min',
    'angularjs-slider': 'bower_components/angularjs-slider/dist/rzslider.min',
    'clipboard': 'bower_components/clipboard/dist/clipboard.min',
    'd3': 'bower_components/d3/d3.min',
    'domReady': 'bower_components/requirejs-domready/domReady',
    'error-reporting': 'bower_components/error-reporting/errorReportingDirective',
    'export-directive': 'bower_components/export-directive/export-directive',
    'file-saver': 'bower_components/file-saver/FileSaver.min',
    'gemtc-web': 'bower_components/gemtc-web/app/js',
    'help-popup': 'bower_components/help-popup/help-directive',
    'jQuery': 'bower_components/jquery/dist/jquery.min',
    'lodash': 'bower_components/lodash/dist/lodash.min',
    'MathJax': 'bower_components/MathJax/MathJax.js?config=TeX-MML-AM_HTMLorMML',
    'mcda': 'bower_components/mcda-web/app/js',
    'mmfoundation': 'bower_components/angular-foundation-6/dist/angular-foundation.min',
    'modernizr': 'bower_components/modernizr/modernizr',
    'moment': 'bower_components/moment/min/moment.min',
    'ngSanitize': 'bower_components/angular-sanitize/angular-sanitize.min',
    'nvd3': 'bower_components/nvd3/build/nv.d3.min',
    'showdown': 'bower_components/showdown/dist/showdown.min',
    'xlsx': 'bower_components/xlsx/dist/xlsx.full.min',
    'xlsx-shim': 'bower_components/xlsx/demos/requirejs/xlsx-shim',
    'angucomplete-alt': 'bower_components/angucomplete-alt/dist/angucomplete-alt.min'
  },
  baseUrl: 'app/js',
  shim: {
    'jQuery': {
      exports: 'jQuery'
    },
    'angular': {
      deps: ['jQuery'],
      exports: 'angular'
    },
    'angular-cookies': {
      deps: ['angular'],
      exports: 'angular-cookies'
    },
    'angular-md5': {
      deps: ['angular'],
      exports: 'angular-md5'
    },
    'angularanimate': {
      deps: ['angular']
    },
    'mmfoundation': {
      deps: ['angular']
    },
    'angular-touch': {
      deps: ['angular'],
      exports: 'ngTouch'
    },
    'file-saver': {
      exports: 'saveAs'
    },
    'help-popup': {
      deps: ['angular']
    },
    'error-reporting': {
      deps: ['angular']
    },
    'angular-resource': {
      deps: ['angular'],
      exports: 'angular-resource'
    },
    'angular-ui-router': {
      deps: ['angular']
    },
    'angular-select': {
      deps: ['angular', 'jQuery'],
      exports: 'angular-select'
    },
    'ngSanitize': {
      deps: ['angular'],
      exports: 'ngSanitize'
    },
    'd3': {
      exports: 'd3'
    },
    'nvd3': {
      deps: ['d3'],
      exports: 'nv'
    },
    'lodash': {
      exports: '_'
    },
    'domReady': {
      exports: 'domReady'
    },
    'MathJax': {
      exports: 'MathJax'
    },
    'showdown': {
      exports: 'showdown'
    }
  },
  priority: ['angular']
});

require(['xlsx'], function (_XLSX) {
  /* work around require.js */
  return XLSX;
});

window.name = 'NG_DEFER_BOOTSTRAP!';

require(['angular', 'app'], function(angular) {
  require(['domReady!'], function(document) {
    angular.bootstrap(document, ['addis']);
  });
});
