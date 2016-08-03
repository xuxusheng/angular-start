let html = require('./index.html')
require('./index.scss')

export default {
    url: '/accordion',
    template: html,
    controller: class Controller {
        constructor($scope) {
            this.$scope = $scope
            $scope.vm = this

            $scope.groups = [
                {
                    title: 'Dynamic Group Header - 1',
                    content: 'Dynamic Group Body - 1'
                }, {
                    title: 'Dynamic Group Header - 2',
                    content: 'Dynamic Group Body - 2'
                }
            ]
            
            $scope.items = ['Item 1', 'Item 2', 'Item 3']
            
            $scope.addItem = function() {
                let newItemNo = $scope.items.length + 1
                $scope.items.push('Item ' + newItemNo)
            }
            
            $scope.status = {
                isCustomHeaderOpen: false,
                isFirstOpen: true,
                isFirstDisabled: false
            }
        }
    }
}