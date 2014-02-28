angular.module('starter.controllers', ["socketProvider"])


// A simple controller that fetches a list of data from a service
    .controller('PetIndexCtrl', function ($scope, PetService) {
        // "Pets" is a service returning mock data (services.js)
        $scope.pets = PetService.all();
    })


// A simple controller that shows a tapped item's data
    .controller('PetDetailCtrl', function ($scope, $stateParams, PetService) {
        // "Pets" is a service returning mock data (services.js)
        $scope.pet = PetService.get($stateParams.petId);
    })
    .controller('employeeCtrl', ["$scope", "socket", function ($scope, socket) {
        $scope.employees = null;
        debugger
        socket.get("/employee").success(function (data) {
            $scope.employees = data;
        }).error(function () {
            console.log("there was an error");
        });


        socket.socket.on('message', function (message) {
            console.log(message);
            if(message.data){
                $scope.employees.push(message.data);
            }
        });
    }

    ])

;