var myApp = angular.module('myApp');
myApp.controller("modalAccountFormController", ['$scope', '$modal', 'UserService', 'FlashService',
    function ($scope, $modal, UserService, FlashService) {
		$scope.lat = null;
		$scope.long = null;
		$scope.ip = null;
		$scope.address = null;
		$scope.showfields = true;

		$scope.infoid = null;
		$scope.infoFirstName = '';
		$scope.infoLastName = '';
		$scope.infoBloodGroup = '';
		$scope.infoEmail = '';
		$scope.infoContactNumber = '';
		$scope.infoShowDetails = true;

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


		var ModalFormCtrl = function ($scope, $modalInstance, userForm) {
			$scope.form = {}
			$scope.submitForm = function () {
				if ($scope.form.userForm.$valid) {
				    console.log('user form is in scope');
					var user = {
						"firstName"		: $scope.form.userForm.firstname.$modelValue,
						"lastName"		: $scope.form.userForm.lastname.$modelValue,
						"contact"		: $scope.form.userForm.contact.$modelValue,
						"emailAddress"	: $scope.form.userForm.email.$modelValue,
						"bloodGroup" 	: $scope.form.userForm.bloodgroup.$modelValue.bloodgroup,
						"Address"		: $scope.address,
						"IP"			: $scope.ip,
						"Lat" 			: $scope.lat,
						"Long"			: $scope.long 	
					};

					console.log('About to create user:+\n' + JSON.stringify(user));

					UserService.Create(user)
					.then(function (createdUser) {
						console.log('Created user:+\n' + JSON.stringify(createdUser));
						$scope.showfields = false;

						var baseUrl = window.location.origin;
						var editUrl = baseUrl +  '/editDonor?id=' + createdUser._id; 
						FlashService.Success('User created. \nChange url: ' + editUrl, false);


					})
					.catch(function (error) {
						console.log('Error');
						$scope.showfields = false;
						FlashService.Error(error);

					});
				} else {
				    console.log('userform is not in scope');
				}
			};

			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
				FlashService.Reset();
			};
		};

		var ModalInfoCtrl = function ($scope, $modalInstance) {
			$scope.showDetails = function () {
					UserService.GetById($scope.infoid)
					.then(function (user) {
						console.log('Got user details:+\n' + JSON.stringify(user));
						$scope.infoEmail = user.emailAddress;
						$scope.infoContactNumber = user.contact;
						$scope.infoShowDetails = false;
					})
					.catch(function (error) {
						console.log('Error');

					});
			};

			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
		};

        $scope.showForm = function () {

            var modalInstance = $modal.open({
                templateUrl: 'views/modal-form.html',
                controller: ModalFormCtrl,
                scope: $scope,
                resolve: {
                    userForm: function () {
                        return $scope.userForm;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.showInfo = function (user) {
			$scope.infoid = user._id;
			$scope.infoFirstName = user.firstName;
			$scope.infoLastName = user.lastName;
			$scope.infoBloodGroup = user.bloodGroup;

            var modalInstance = $modal.open({
                templateUrl: 'views/modal-info.html',
                controller: ModalInfoCtrl,
                scope: $scope,
                resolve: {}
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
    }]);
