angular.module('emp.controllers', ['emp.services'])
    .controller('welcomeCtl', function ($scope) {
        //console.log(Restangular.all('menus'));
    })
    .controller('welcomeCtl2', function ($scope) {
        socket.get('/menu', {
            message: 'hi there!'
        }, function (response) {
            $scope.menus = response;
        });

    })
;
