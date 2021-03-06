var socket = io.connect();
var readiness = 0, id;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

console.log("*hacker voice* im in");

$(document).ready(function() {
	readiness++;
	tryAppload();

	$("#share").submit(function(e) {
		socket.emit("chat-message", {
			msg: $("#share input").val(),
			user: id
		});
		$("#share input").val("");
		e.preventDefault();
	}).find("input, button").blur(function() {
		$("#share").removeClass("focus");
	}).focus(function() {
		$("#share").addClass("focus");
	});

	$("#share input").on("keydown keypress keyup change", function() {
		if ($(this).val()) $("#share button").removeAttr("disabled");
		else $("#share button").attr("disabled", "disabled");
	});

	var canvas = $("#particles")[0];
	canvas.width = canvas.height = 600;
	var ctx = canvas.getContext("2d"),
		satellites = {},
		width = canvas.width,
		planetwidth = width/8,
		fadeSpeed = 0.01,
		pulseSpeed = 0.05, maxPulseExpand = 2;

	function circle(x, y, r) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.fill();
	}

	ctx.fillStyle = "#f5626c";
	ctx.lineWidth = 0;
	ctx.rect(0, 0, width, width);
	ctx.fill();

	function render() {
		ctx.fillStyle = "rgba(245,98,108,0.3)";
		ctx.lineWidth = 0;
		ctx.rect(0, 0, width, width);
		ctx.fill();
		ctx.fillStyle = "#eee";
		circle(width/2, width/2, width/16);
		for (var key in satellites) {
			if (satellites.hasOwnProperty(key)) {
				var particle = satellites[key];
				if (particle.state == "entering") {
					particle.transparent += fadeSpeed;
					if (particle.transparent >= 1) particle.state = "present";
				} else if (particle.state == "leaving") {
					particle.transparent -= fadeSpeed;
					if (particle.transparent <= 0) delete satellites[key];
				} else if (particle.speaking) {
					var array = new Uint8Array(particle.analyzer.frequencyBinCount);
					particle.analyzer.getByteFrequencyData(array);
					var sum = 0, average;
					for (var i = 0; i < array.length; i++) sum += array[i];
					average = sum/array.length/50;
					particle.radius = 1+average;
				}
				ctx.fillStyle = "rgba(238,238,238,"+particle.transparent+")";
				circle(
					Math.cos(particle.theta)*particle.distance+width/2,
					Math.sin(particle.theta)*particle.distance+width/2,
					width/100*particle.radius);
				particle.theta += particle.velocity;
			}
		}
		requestAnimationFrame(render);
	}

	render();

	var context = new AudioContext();

	function playAudio(url, speaker) {
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		request.onload = function() {
			context.decodeAudioData(request.response, function(buffer) {
				var source = context.createBufferSource(), analyzer;
				source.buffer = buffer;
				if (speaker) {
					var particle = satellites[speaker];
					if (particle.speaking) {
						analyzer = particle.analyzer;
					} else {
						analyzer = context.createAnalyser();
						analyzer.smoothingTimeConstant = 0.3;
						analyzer.fftSize = 1024;
						analyzer.connect(context.destination);
						particle.analyzer = analyzer;
					}
					source.connect(analyzer);
					particle.speaking++;
					source.onended = function() {
						particle.speaking--;
						particle.radius = 1;
					}
				} else {
					source.connect(context.destination);
				}
				source.start(0);
			}, function() {
				console.log("Failed to load "+url);
			});
		}
		request.send();
	}

	function addUser(id) {
		var d = Math.random();
		satellites[id] = {
			distance: d*(width/2-planetwidth-20)+planetwidth,
			velocity: (1-d)*Math.PI/100+Math.PI/100,
			theta: Math.random()*Math.PI*2,
			radius: 1,
			transparent: 0,
			speaking: 0,
			analyzer: null,
			state: "entering"
		}
	}

	socket.on("sync", function(data) {
		satellites = {};
		console.log(data.ids);
		for (var i = 0; i < data.ids.length; i++)
			addUser(data.ids[i]);
		id = data.id;
	});

	socket.on("user-connected", function(data) {
		playAudio(data.msg, data.user);
		console.log(data.user);
		if (data.user != id) addUser(data.user);
	});

	socket.on("user-disconnected", function(data) {
		playAudio(data.msg);
		satellites[data.user].state = "leaving";
	});

	socket.on("chat-message", function(data) {
		playAudio(data.msg, data.user);
	});
});

socket.on("connect", function() {
	socket.emit("user-connected", "A user has connected.");
	readiness++;
	tryAppload();
});

setTimeout(function() {
	readiness++;
	tryAppload();
}, 2000);

function tryAppload() {
	if (readiness >= 3) {
		$("#share input").focus();
		$("#application").removeClass("away");
		setTimeout(function() {
			$("#application .splash").hide();
		}, 300);
	}
}
