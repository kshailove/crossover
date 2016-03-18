(function () {
    'use strict';

    angular
        .module('myApp', ['ui.bootstrap', 'ui.router'])
        .config(config);

    function config($stateProvider, $urlRouterProvider) {
        // default route
        $urlRouterProvider.otherwise("/");
    }
})();
