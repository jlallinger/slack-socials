var express = require("express");
var bodyParser = require("body-parser");
var request = require("superagent");


var SocialServer = function(hookUrl)
{
	var app = express();
	app.use(bodyParser.urlencoded({ extended: true }));


	app.post("/verb/:verb", function(req, res)
	{
		var verb =  req.params.verb.split("|");
		var username = req.body.user_name;

		var message = username + " " + verb[0];
		if (req.body.text)
		{
			message = message + " " + (verb[1] == "" ? "" : verb[1] + " ") + req.body.text
				.replace(/@\w+/, "<$&>")
				.replace(" " + verb[1], "")
				.replace(verb[1] + " ", "");
		}
		message = message + ".";

		var channel = "#" + req.body.channel_name;

		request.post(hookUrl)
			.send({
				channel: channel,
				text: message,
				unfurl_links: true,
				link_names: 1,
				icon_emoji: verb[2]
			})
			.end();
		res.send(200, "");
	});

	return app;
};

if (module.parent == null)
{
	var port = process.env.PORT || 9999;
	var hookUrl = process.env.HOOK_URL;

	var app = SocialServer(hookUrl);
	console.log("Postback url: %s", hookUrl);
	console.log("Listening on %d", port);
	app.listen(port);
}

module.exports = SocialServer;