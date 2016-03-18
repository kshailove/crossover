(function () {
    'use strict';

    angular
        .module('myApp2', ['ui.bootstrap', 'ui.router'])
		.controller('changeUserFormController', ChangeUserFormController)
        .config(config)
		.config(config2);

    function config($urlRouterProvider) {
        // default route
        $urlRouterProvider.otherwise("/");
    }

    function config2($locationProvider) {
        // default route

		$locationProvider.html5Mode({
		  enabled: true,
		  requireBase: false
		});
    }

	function ChangeUserFormController($scope, $location, UserService, FlashService) {
		$scope.id = $location.search().id;
		$scope.showfields = true;

		$scope.bloodgroups = [
		    {'bloodgroup': 'A+'},
		    {'bloodgroup': 'B+'},
		    {'bloodgroup': 'O+'},
		    {'bloodgroup': 'A-'},
		    {'bloodgroup': 'B-'},
		    {'bloodgroup': 'O-'},
		    {'bloodgroup': 'AB+'},
		    {'bloodgroup': 'AB-'}
    	];

		$scope.saveUser = function() {
			console.log('about to save user ' + $scope.id);

			var user = {
				"_id"			: $scope.id,
				"firstName"		: $scope.form.userForm.firstname.$modelValue,
				"lastName"		: $scope.form.userForm.lastname.$modelValue,
				"contact"		: $scope.form.userForm.contact.$modelValue,
				"emailAddress"	: $scope.form.userForm.email.$modelValue,
				"bloodGroup"	: $scope.form.userForm.bloodgroup.$modelValue.bloodgroup
			};

			UserService.Update(user)
			.then(function () {
				console.log('Updated donor:+\n' + JSON.stringify(user));
				FlashService.Success('Updated donor details');
				$scope.showfields = false;
			})
			.catch(function (error) {
				console.log('Error');
				FlashService.Error(error);
			});
		}

		$scope.deleteUser = function() {
			console.log('about to delete user ' + $scope.id);

			UserService.Delete($scope.id)
			.then(function () {
				console.log('Deleted user:+\n' + JSON.stringify($scope.id));
				FlashService.Success('Deleted donor details');
				$scope.showfields = false;
			})
			.catch(function (error) {
				console.log('Error');
				FlashService.Error(error);
			});
		}

		angular.element(document).ready(function () {

			UserService.GetById($scope.id)
			.then(function (user) {
				console.log('Got user details:+\n' + JSON.stringify(user));

				
			})
			.catch(function (error) {
				console.log('Error');
				FlashService.Error(error);
			});
		});
	}

})();
