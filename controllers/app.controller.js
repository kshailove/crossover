﻿var express = require('express');
var router = express.Router();

// serve angular app files from the '/app' route
router.use('/', express.static('app'));

module.exports = router;
