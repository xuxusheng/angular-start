import angular from 'angular'
import 'angular-ui-router'
import 'angular-ui-bootstrap'
import 'angular-animate'

// require('../lib/layout.css')
// require('../lib/neat.css')
require('bootstrap/dist/css/bootstrap.css')
require('../lib/font-awesome-4.6.3/css/font-awesome.min.css')

export default angular.module('app', ['ui.router', 'ui.bootstrap', 'ngAnimate'])