const html = require('./index.html')
import app from '../../module/'
require('./index.scss')

app.directive('headerBanner', () => ({
    restrict: 'E',
    template: html,
    scope: {}
}))