import app from '../module/index.js'
import homePage from './homePage/index.js'
import test from './test/index.js'

import uibExample from './uibExample/index'
import uibExampleAccordion from './uibExample/accordion/index'

app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {

    // $locationProvider.html5Mode({
    //     enabled: true
    // })
    
    $urlRouterProvider.otherwise('/');
    
    $stateProvider
        .state('/', homePage)
        .state('test', test)

        .state('uibExample', uibExample)
        .state('uibExample.accordion', uibExampleAccordion)
}])