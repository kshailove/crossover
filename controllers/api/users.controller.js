var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

// routes
router.post('/register', registerUser);
router.post('/getUsersInRegion', getUsersInRegion);
router.get('/:_id', getById);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);

module.exports = router;


function registerUser(req, res) {
    userService.create(req.body)
        .then(function (doc) {
			res.status(200);
            res.setHeader('Content-Type', 'application/json');
    		res.send(JSON.stringify(doc));
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getUsersInRegion(req, res) {
    userService.getUsersInRegion(req.body)
        .then(function (results) {
            res.sendStatus(JSON.stringify(results));
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getById(req, res) {
    userService.getById(req.params._id)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function updateUser(req, res) {
    userService.update(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    userService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
