var https = require("https");
var url = require("url");
var userAgent = "Node GitHub Request " + require( "../package" ).version;

function extend(a, b) {
	for (var prop in b) {
		a[prop] = b[prop];
	}

	return a;
}

function xHeader(str) {
	if (str.substring(0, 2) === "x-" ) {
		str = str.substring(2);
	}

	return str.replace(/-([a-z])/g, function(all, letter) {
		return letter.toUpperCase();
	});
}

function request(settings, data, callback) {
	if (typeof data === "function") {
		callback = data;
		data = null;
	} else {
		data = JSON.stringify(data);
	}
	callback = callback || function() {};

	settings = extend({
		method: "GET"
	}, settings);
	settings.headers = extend({
		"user-agent": userAgent,
		"content-length": typeof data === "string" ? Buffer.byteLength(data, "utf8") : 0
	}, settings.headers || {});

	var req = https.request(extend({
		host: "api.github.com"
	}, settings), function(res) {
		var meta = {};
		Object.keys(res.headers).forEach(function(header) {
			if (/^(x-(ratelimit|github))/.test(header)) {
				meta[xHeader(header)] = res.headers[header];
			} else if (header === "link") {
				var links = res.headers.link.split(/,\s*/);
				meta.links = {};
				links.forEach(function(link) {
					var parts = /<([^>]+)>;\s*rel="([^"]+)"/.exec(link);
					meta.links[parts[2]] = parts[1];
				});
			}
		});

		var response = "";
		res.setEncoding("utf8");
		res.on("data", function(chunk) {
			response += chunk;
		});

		res.on("end", function() {
			if (res.statusCode >= 400) {
				var message;
				if (res.headers["content-type"].indexOf("json") !== -1) {
					message = JSON.parse(response).message;
				} else {
					message = response;
				}
				if (!message && res.statusCode === 403) {
					message = "Forbidden";
				}
				callback(new Error(message));
			} else {
				callback(null, JSON.parse(response), meta);
			}
		});
	});

	req.on("error", callback);

	if (data) {
		req.write(data);
	}

	req.end();
}

function requestAll(settings, callback) {

	// Force the request to use a page size of 100 for optimal performance
	var parsed = url.parse(settings.path, true);
	delete parsed.search;
	parsed.query.per_page = 100;
	settings.path = url.format(parsed);

	request(settings, function(error, data, meta) {
		if (error) {
			return callback(error);
		}

		if (!meta.links || !meta.links.next) {
			return callback(null, data, meta);
		}

		settings.path = url.parse(meta.links.next).path;
		requestAll(settings, function(error, nextData, nextMeta) {
			if (error) {
				return callback(error);
			}

			callback(null, data.concat(nextData), nextMeta);
		});
	});
}

module.exports = {
	request: request,
	requestAll: requestAll
};
