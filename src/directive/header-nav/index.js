const html = require('./index.html')
import app from '../../module/'
require('./index.scss')

app.directive('headerNav', () => ({
    restrict: 'E',
    template: html,
    scope: {},
    controller: ($scope) => {
        $scope.test = 'directive test'
    }
}))