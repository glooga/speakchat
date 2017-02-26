var express = require("express");
var router = express.Router();
var TextToSpeechV1 = require("watson-developer-cloud/text-to-speech/v1");
var fs = require("fs");
var count = 0;
var ids = [];

var text_to_speech = new TextToSpeechV1({
	"url": "https://stream.watsonplatform.net/text-to-speech/api",
	"username": "2197e94c-7b36-4fe9-9201-163ae829b54d",
	"password": "GOaQck84Si3B"
});


module.exports = function(io) {
	io.on("connection", function(socket) {
		var id = Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 10);
		ids.push(id);
		socket.emit("sync", { ids: ids, id:  id });
		socket.on("chat-message", function(data) {
			var name = Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 10);
			var params = {
				text: data.msg,
				voice: "en-US_AllisonVoice", // Optional voice
				accept: "audio/wav"
			};

			// Pipe the synthesized text to a file
			text_to_speech.synthesize(params).pipe(fs.createWriteStream(name+".wav"));
			io.emit("chat-message", { user: data.user, msg: "/memes/" + name + ".wav" });
		});
		socket.on("user-connected", function() {
			io.emit("user-connected", { user: id, msg: "/memes/connected.wav" });
		});
		socket.on("disconnect", function(data) {
			var index = ids.indexOf(id);
			if (index > -1) {
				ids.splice(index, 1);
			}
			io.emit("user-connected", { user: id, msg: "/memes/disconnected.wav" });
		});
	});

	/* GET home page. */
	router.get("/", function(req, res, next) {
		res.render("index", {
			title: "SpeakChat",
			count: count
		});
	});

	return router;
};
