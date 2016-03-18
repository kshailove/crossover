(function() {
    'use strict';

    angular
        .module("myApp")
        .factory("UserService", UserService);

    UserService.$inject = ["$http", "$q"];

    function UserService($http, $q) {
        var service = {};

        service.GetUsersInRegion = GetUsersInRegion;
        service.GetById = GetById;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetUsersInRegion(top, left, bottom, right) {
			var region = {
				"top" : top,
				"left" : left,				
				"bottom" : bottom,
				"right" : right,
			};
            return $http.post('/api/users/getUsersInRegion', region).then(handleSuccess, handleError);
        }

        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post('/api/users/register', user).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    };

})();


