(function() {
    'use strict';

    angular
        .module("myApp")
        .controller("mainController", MainController);

    MainController.$inject = ['$scope', 'UserService', 'SocketService'];

    function MainController($scope, UserService, SocketService) {
		$scope.visibleUsers = {};

		$scope.xmin = 0;
		$scope.ymin = 0;
		$scope.xmax = 0;
		$scope.ymax = 0;

		$scope.gl = null;

		$scope.address = '';

		// Just to confirm a communication with socket server
		SocketService.emit('test', 'hello');
		SocketService.on('reply', function(data) {
			console.log('Received reply:' + data);
		});

		var initController2 = function() {
			  var map;
		
			  require([
				"esri/map", 
"esri/geometry/webMercatorUtils",
				"esri/tasks/locator",
				"esri/InfoTemplate",
				"esri/symbols/SimpleLineSymbol",
				"esri/geometry/Point",
				"esri/geometry/Extent",
				"esri/symbols/PictureMarkerSymbol",
				"esri/symbols/SimpleMarkerSymbol",
				"esri/graphic", 
				"esri/layers/GraphicsLayer",
				"esri/SpatialReference",
				"dojo/domReady!"
			  ], function(
				Map, webMercatorUtils, Locator, InfoTemplate, SimpleLineSymbol, Point, Extent, PictureMarkerSymbol, SimpleMarkerSymbol, Graphic, GraphicsLayer, SpatialRefernce
			  ) {
			  	var initialExtent = new esri.geometry.Extent({"xmin":244598,"ymin":6241389,"xmax":278995,"ymax":6264320,"spatialReference":{"wkid":102100}});
				var map = new esri.Map("map", {
					basemap: "streets",
					extent: initialExtent
				});

				var locator = new Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");

				var infoTemplate = new InfoTemplate("Location", "Address: ${Address}");
				var symbol = new SimpleMarkerSymbol();

				locator.on("location-to-address-complete", function(evt) {
				  if (evt.address.address) {
				    var address = evt.address.address;
				    var location = webMercatorUtils.geographicToWebMercator(evt.address.location);
					$scope.address = address.Match_addr;

				    //this service returns geocoding results in geographic - convert to web mercator to display on map
				    // var location = webMercatorUtils.geographicToWebMercator(evt.location);
				    var graphic = new Graphic(location, symbol, address, infoTemplate);
				    //map.graphics.add(graphic);

				    map.infoWindow.setTitle(graphic.getTitle());
				    map.infoWindow.setContent(graphic.getContent());

				    //display the info window with the address information
				    var screenPnt = map.toScreen(location);
				    map.infoWindow.resize(200,100);
				    map.infoWindow.show(screenPnt, map.getInfoWindowAnchor(screenPnt));

				  }
				});

				
				map.on("load", function() {
				  $scope.gl = new GraphicsLayer("mylayer");
				  map.addLayer($scope.gl);
				});
			
				function plotAllUsersInRegion() {
			  		map.removeLayer($scope.gl);
			  		$scope.gl = new GraphicsLayer("mylayer");
					for(var id in $scope.visibleUsers) {
						var userdata = $scope.visibleUsers[id];
						var p = new Point(userdata.Lat, userdata.Long,map.spatialReference);
						// var s = new SimpleMarkerSymbol().setSize(20);

						var s = new PictureMarkerSymbol('http://www.clker.com/cliparts/m/u/A/B/A/b/icon-pin-336699-md.png', 18, 30);
						var g = new Graphic(p, s);
						$scope.gl.add(g);
					}
					map.addLayer($scope.gl);
				}

				// Click handler on map
				map.on("click", myClickHandler);
				function myClickHandler(event) {
					console.log("User clicked at "  
							+ event.screenPoint.x + ", " + event.screenPoint.y +
							" on the screen. The map coordinate at this point is " + 
							event.mapPoint.x + ", " + event.mapPoint.y
						  );

          			locator.locationToAddress(webMercatorUtils.webMercatorToGeographic(event.mapPoint), 100);
					// First find if there are any pins already in this neighbourhood
					function pointToExtent(map, point, toleranceInPixel) {
					  //calculate map coords represented per pixel
					  var pixelWidth = map.extent.getWidth() / map.width;
					  //calculate map coords for tolerance in pixel
					  var toleraceInMapCoords = toleranceInPixel * pixelWidth;
					  //calculate & return computed extent
					  return new esri.geometry.Extent( point.x - toleraceInMapCoords,
								   point.y - toleraceInMapCoords,
								   point.x + toleraceInMapCoords,
								   point.y + toleraceInMapCoords,
								   map.spatialReference );
					}
					var extentGeom = pointToExtent(map, event.mapPoint, 12);

					// Very crude method to search the nearest pin
					// This is definitely not scalable
					// I am sure there must an efficient dojo api.
					var existingUser = null;
					for(var id in $scope.visibleUsers) {
						var userdata = $scope.visibleUsers[id];
						if((userdata.Lat > extentGeom.xmin && userdata.Lat < extentGeom.xmax) && (userdata.Long > extentGeom.ymin && userdata.Long < extentGeom.ymax)) {
							existingUser = id;							
							break;	
						}
					}

					if(existingUser) {
						// User already exists, we need to show the information of user in a dialog.
						$scope.$parent.showInfo($scope.visibleUsers[existingUser]);
					}
					else {
						var userData = {
								"ip"			: "TBD",
								"address"		: $scope.address,
								"lat" 			: event.mapPoint.x,
								"long"			: event.mapPoint.y 
						};
						$scope.$parent.lat = userData.lat;
						$scope.$parent.long = userData.long;
						$scope.$parent.ip = userData.ip;
						$scope.$parent.address = $scope.address;
						$scope.$parent.showForm();
					}
				}

				// We are interseted whenever extent changes.
				// We need to redraw the pins
				dojo.connect(map, "onExtentChange", myExtentChangeHandler);
				function myExtentChangeHandler(extent) {
					$scope.xmin = extent.xmin;
					$scope.ymin = extent.ymin;
					$scope.xmax = extent.xmax;
					$scope.ymax = extent.ymax;

					$scope.gl = new GraphicsLayer();

					var s = "";
					s = "XMin: "+ extent.xmin.toFixed(2) + " "
					   +"YMin: " + extent.ymin.toFixed(2) + " "
					   +"XMax: " + extent.xmax.toFixed(2) + " "
					   +"YMax: " + extent.ymax.toFixed(2);
					console.log(s);
		
					UserService.GetUsersInRegion($scope.xmin, $scope.ymin, $scope.xmax, $scope.ymax)
					.then(function (users) {
						// Got users in this region.
						// We need to add these users in a live data structure
						console.log("Users available for this extent:" + users.length);
						for(var i = 0; i < users.length; i++) {
							var key = users[i]._id;
							$scope.visibleUsers[key] = users[i];
						};
						//console.log('$scope.visibleUsers');
						//console.log(JSON.stringify($scope.visibleUsers));

						// Write code here to add these users on the map as pins
						plotAllUsersInRegion();

					})
					.catch(function (error) {
						console.log('Error');
					});

					// Whenever usercreated, userupdated or userdeleted events are reported on socket,
					// we need to modify the data structure and accordingly update the pin on the map
					SocketService.on('usercreated', function(data) {
						console.log('Received usercreated event:' + JSON.stringify(data));


						// First update $scope.visibleUsers
						// add this user only if it is in current view
						var userLat = data.Lat;
						var userLong = data.Long;
						var userid = data._id;
						if((userLat > $scope.xmin && userLat < $scope.xmax) && (userLong > $scope.ymin && userLong < $scope.ymax)) {
							$scope.visibleUsers[userid] = data;
						}

						// Then create a pin accordinly.
						plotAllUsersInRegion();

					});

					SocketService.on('userupdated', function(data) {
						console.log('Received userupdated event:' + JSON.stringify(data));


						// First update $scope.visibleUsers
						// update this user only if it is in current view
						var userLat = data.Lat;
						var userLong = data.Long;
						var userid = data._id;
						if((userLat > $scope.xmin && userLat < $scope.xmax) && (userLong > $scope.ymin && userLong < $scope.ymax)) {
							$scope.visibleUsers[userid] = data;
						}

						// No need to update the pin, since id of user will be same

					});

					SocketService.on('userdeleted', function(data) {
						console.log('Received userdeleted event:' + JSON.stringify(data));

						// First update $scope.visibleUsers
						delete $scope.visibleUsers[data]

						// Then remove the respective pin accordinly.
						plotAllUsersInRegion();

					});
				}

			  });
		}

		// initialize the controller
		initController2();
    };

})();

