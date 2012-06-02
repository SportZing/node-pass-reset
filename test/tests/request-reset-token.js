
var buster     = require('buster');
var uuid       = require('uuid-v4');
var passreset  = require('../../lib');
var io         = require('../io-setup');
var mockhttp   = require('../mock-http');

buster.testCase('Request Reset Token', {
	'requestResetToken() should return a function': function() {
		buster.assert.equals(typeof passreset.requestResetToken(), 'function', 'without config');
		buster.assert.equals(typeof passreset.requestResetToken({ }), 'function', 'with empty config');
		buster.assert.equals(typeof passreset.requestResetToken({ foo: 'bar' }), 'function', 'with invalid config');
		buster.assert.equals(typeof passreset.requestResetToken({ next: true }), 'function', 'with valid config');
	},
	
	'simple requestResetToken() responses': {
		setUp: function() {
			this.routeFunction  = passreset.requestResetToken();
			this.response       = new mockhttp.Response();
		},
		
		'no body should result in 400 error': function(done) {
			var req = new mockhttp.Request();
			this.response.on('respond', function(res) {
				buster.assert.equals(res.status, 400);
				var response = JSON.parse(res.response);
				buster.assert.equals(response.error.message, 'No login given');
				done();
			});
			this.routeFunction(req, this.response, function() {
				buster.assert(false, '`next` should not be called in the case of an error');
				done();
			});
		},
		
		'invalid login should result in 404 error': function(done) {
			var req = new mockhttp.Request({ login: 'invalid' });
			this.response.on('respond', function(res) {
				buster.assert.equals(res.status, 404);
				var response = JSON.parse(res.response);
				buster.assert.equals(response.error.message, 'No such user');
				done();
			});
			this.routeFunction(req, this.response, function() {
				buster.assert(false, '`next` should not be called in the case of an error');
				done();
			});
		},
		
		'valid request should result in 200 OK and an email (single user)': function(done) {
			var completed = { };
			var req = new mockhttp.Request({ login: 'valid' });
			this.response.on('respond', function(res) {
				buster.assert.equals(res.status, 200);
				buster.assert.equals(res.response, '');
				completed.response = true;
				checkIfDone();
			});
			io.once('sendEmail', function(address, resets) {
				buster.assert.equals(address, 'foo1@example.com');
				buster.assert.equals(resets.length, 1);
				var user = resets[0];
				buster.assert.equals(user.name, 'foo');
				buster.assert(uuid.isUUID(user.token), 'token should be a valid v4 uuid');
				buster.assert(user.url.indexOf(user.token) >= 0, 'callback URL should contain the token');
				buster.assert.equals(passreset._storage.lookup(user.token), 123);
				completed.email = true;
				checkIfDone();
			});
			this.routeFunction(req, this.response, function() {
				buster.assert(false, '`next` should not be called if opts.next is false/null');
				done();
			});
			function checkIfDone() {
				if (completed.response && completed.email) {
					done();
				}
			}
		},
		
		'valid request should result in 200 OK and an email (multi-user)': function(done) {
			var completed = { };
			var req = new mockhttp.Request({ login: 'multivalid' });
			this.response.on('respond', function(res) {
				buster.assert.equals(res.status, 200);
				buster.assert.equals(res.response, '');
				completed.response = true;
				checkIfDone();
			});
			io.once('sendEmail', function(address, resets) {
				buster.assert.equals(address, 'foo2@example.com');
				buster.assert.equals(resets.length, 2);
				
				var user = resets[0];
				buster.assert.equals(user.name, 'bar');
				buster.assert(uuid.isUUID(user.token), 'token should be a valid v4 uuid');
				buster.assert(user.url.indexOf(user.token) >= 0, 'callback URL should contain the token');
				buster.assert.equals(passreset._storage.lookup(user.token), 234);
				
				user = resets[1];
				buster.assert.equals(user.name, 'baz');
				buster.assert(uuid.isUUID(user.token), 'token should be a valid v4 uuid');
				buster.assert(user.url.indexOf(user.token) >= 0, 'callback URL should contain the token');
				buster.assert.equals(passreset._storage.lookup(user.token), 345);
				
				completed.email = true;
				checkIfDone();
			});
			this.routeFunction(req, this.response, function() {
				buster.assert(false, '`next` should not be called if opts.next is false/null');
				done();
			});
			function checkIfDone() {
				if (completed.response && completed.email) {
					done();
				}
			}
		}
	}
});

