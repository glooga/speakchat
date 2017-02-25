module.exports = function(io) {
	var express = require('express');
	var router = express.Router();
	var count = 0;

	io.on('connection', function(socket){
		socket.on('chat-message', function(msg){
			io.emit('chat-message', msg);
		});
		socket.on('connect', function(msg){
			count++;
			console.log("A user has connected");
			io.emit('user-connected', "A user has connected");
		});
		socket.on('disconnect', function(msg){
			count--;
			console.log("A user has disconnected");
			io.emit('user-disconnected', "A user has disconnected");
		});
	});

	/* GET home page. */
	router.get('/', function(req, res, next) {
	  res.render('index', { title: 'SpeakChat', count: count });
	});

	return router;
};
