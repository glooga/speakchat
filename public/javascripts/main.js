var socket = io.connect('http://localhost:3000');

console.log("*hacker voice* im in");

socket.on('connect', function() {
    socket.emit('user-connected', "A user has connected.");
});
socket.on('chat-message', function(data) {
	var audio = new Audio(data.msg);
	audio.play();
});
socket.on('user-connected', function(data) {
	var audio = new Audio(data);
	audio.play();
});
socket.on('user-disconnected', function(data) {
	var audio = new Audio(data);
	audio.play();
});
