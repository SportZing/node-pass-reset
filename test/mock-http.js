
var events = require('events');

// ------------------------------------------------------------------

var Request = exports.Request = function(body) {
	if (typeof body === 'string') {
		body = JSON.parse(body);
	}
	this.body = body || { };
};

// ------------------------------------------------------------------

var Response = exports.Response = function() {
	this.status        = 200;
	this.response      = '';
	this.redirectedTo  = null;
};

Response.prototype = new events.EventEmitter();

Response.prototype.json = function(response, status) {
	if (typeof response === 'number' && ! status) {
		this.status = response;
	} else {
		this.response = JSON.stringify(response);
		this.status = status || 200;
	}
	this.emit('respond', this);
};

Response.prototype.send = function(response, status) {
	if (typeof response === 'number' && ! status) {
		this.status = response;
	} else {
		this.response = String(response);
		this.status = status || 200;
	}
	this.emit('respond', this);
};

Response.prototype.redirect = function(redirectTo, status) {
	this.redirectedTo = redirectTo;
	this.status = status || 302;
	this.emit('respond', this);
};

