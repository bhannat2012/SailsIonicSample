angular.module("MyApp", ["SocketProvider"])
    .controller("MyController", ["$scope", "socket", function($scope, socket) {
        // Fetch initial data
        $scope.person = null;
        socket.get("/person/1").success(function(data) {
            $scope.person = data;
        }).error(function() {
            console.log("there was an error");
        });
        // Listen for updates to the person with the id of 1
        var socketOff = socket.on("person", 1, function(data) {
            $scope.person = data;
        });
        // Clean up
        $scope.$on("$destroy", function() {
            socketOff();
        });
    }]);