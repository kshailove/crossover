var config = require('config.json');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(config.connectionString);
var usersDb = db.get('users');
var Q = require('q');
var EVENT_EMITTER       = require(__dirname + '/../events.js');

var service = {};

service.create = create;
service.getUsersInRegion = getUsersInRegion;
service.getById = getById;
service.update = update;
service.delete = _delete;

module.exports = service;

var GlobalEventEmitter = EVENT_EMITTER.getEventEmitter();

// DONE
function create(userParam) {
    var deferred = Q.defer();

	createUser();
    function createUser() {
        usersDb.insert(
            userParam,
            function (err, doc) {
                if (err) deferred.reject(err);

				GlobalEventEmitter.emit('usercreated', doc);
                deferred.resolve(doc);
            });
    }

    return deferred.promise;
}

// DONE
function getUsersInRegion(params) {
    var deferred = Q.defer();

	var top = params.top,
		left = params.left,
		bottom = params.bottom,
		right = params.right;


	usersDb.find({
		$and : [
			{ "Lat": { $gt: top, $lt: bottom } },
			{ "Long": { $gt: left, $lt: right } },
		]
	}, ['firstName', 'lastName', 'bloodGroup' , 'Address', 'Lat', 'Long'],
	function (err, results) {
		if (err) deferred.reject(err);
        if (results) {
            // return users
			//console.log("***" + JSON.stringify(results));
            deferred.resolve(results);
        } else {
            // users not found
            deferred.resolve();
        }
	});
    return deferred.promise;
}

// DONE
function getById(_id) {
    var deferred = Q.defer();

    usersDb.findById(_id, function (err, user) {
        if (err) deferred.reject(err);

        if (user) {
            // return user
            deferred.resolve(user);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    // validation
    usersDb.findById(_id, function (err, user) {
        if (err) deferred.reject(err);
		
		updateUser();
    });

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
			contact: userParam.contact,
			emailAddress: userParam.emailAddress,
			bloodGroup: userParam.bloodGroup
        };

        usersDb.findAndModify(
            { _id: _id },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err);

				GlobalEventEmitter.emit('userupdated', doc);
                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    usersDb.remove(
        { _id: _id },
        function (err) {
            if (err) deferred.reject(err);

			GlobalEventEmitter.emit('userdeleted', _id);
            deferred.resolve();
        });

    return deferred.promise;
}

