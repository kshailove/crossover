require('rootpath')();
var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var bodyParser = require('body-parser');
var config = require('config.json');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// routes
app.use('/app', require('./controllers/app.controller'));
app.use('/editDonor', require('./controllers/editDonor.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});



// Socket.io Communication
io.sockets.on('connection', require('./controllers/socket.controller'));

server.listen(3000, function () {
    console.log('Server listening at port ' + server.address().port);
});



