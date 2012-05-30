
var buster     = require('buster');
var passreset  = require('../../lib');

buster.testCase('Request Reset Token', {
	'requestResetToken() should return a function': function() {
		buster.assert.equals(typeof passreset.requestResetToken(), 'function');
		buster.assert.equals(typeof passreset.requestResetToken({ }), 'function');
	},
	'requestResetToken() responses': {
		setUp: function() {
			this.route = passreset.requestResetToken();
		},
		'no body should result in 400 error': {
			var req = new MockRequest();
			var res = new MockResponse();
		}
	}
});

function MockRequest(body) {
	this.body = body;
}

function MockResponse() {
	this.status        = null;
	this.response      = null;
	this.redirectedTo  = null;
}

MockResponse.prototype.json = function(response, status) {
	if (typeof response === 'number' && ! status) {
		this.status = response;
	} else {
		this.response = JSON.stringify(response);
		this.status = status || 200;
	}
};

MockResponse.prototype.send = function(response, status) {
	if (typeof response === 'number' && ! status) {
		this.status = response;
	} else {
		this.response = String(response);
		this.status = status || 200;
	}
};

MockResponse.prototype.redirect = function(redirectTo) {
	this.redirectedTo = redirectTo;
};















