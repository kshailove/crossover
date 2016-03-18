// System includes
var EVENTS      = require('events'),
    UTIL        = require('util');

// Globals
var eventEmitter = null;

function getEventEmitter() {
    if(!eventEmitter)
        eventEmitter = new GlobalEventEmitter();

    return eventEmitter;
}

function GlobalEventEmitter() {}

UTIL.inherits(GlobalEventEmitter, EVENTS.EventEmitter);

exports = module.exports = {
    getEventEmitter : getEventEmitter
};
