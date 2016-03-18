var EVENT_EMITTER       = require(__dirname + '/../events.js');

var GlobalEventEmitter = EVENT_EMITTER.getEventEmitter();

// export function for listening to the socket
module.exports = function(socket) {
	console.log('Connected');	  

	socket.on('test', function(msg){
		console.log('message: ' + msg);
		socket.emit('reply', 'got your message:' + msg);
	});

	socket.on('disconnect', function () {
		console.log('Disconnected');
	});

	GlobalEventEmitter.on('usercreated', function(data) {
		socket.emit('usercreated', data);
	});

	GlobalEventEmitter.on('userupdated', function(data) {
		socket.emit('userupdated', data);
	});

	GlobalEventEmitter.on('userdeleted', function(data) {
		socket.emit('userdeleted', data);
	});
};
