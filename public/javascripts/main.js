var socket = io.connect('http://localhost:3000');

console.log("*hacker voice* im in");

socket.on('connect', function() {
	console.log("You've Connected!!!");
    socket.emit('connect', "A user has connected.");
});
socket.on('chat-message', function(data) {

});
socket.on('user-connected', function(data) {
	var msg = new SpeechSynthesisUtterance(data);
	window.speechSynthesis.speak(msg);
});
socket.on('user-disconnected', function(data) {
	var msg = new SpeechSynthesisUtterance(data);
	window.speechSynthesis.speak(msg);
});
