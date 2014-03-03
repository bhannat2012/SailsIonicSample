angular.module('emp.controllers', ['emp.services', 'restangular'])
    .controller('welcomeCtl', [ '$scope', 'Restangular', function (scope, Restangular) {
        console.log(Restangular.all('menus'));
    }]);
