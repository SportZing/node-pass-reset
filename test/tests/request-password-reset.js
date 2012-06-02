
var buster     = require('buster');
var uuid       = require('uuid-v4');
var passreset  = require('../../lib');
var io         = require('../io-setup');
var mockhttp   = require('../mock-http');

buster.testCase('Request Password Reset', {
	'resetPassword() should return a function': function() {
		buster.assert.equals(typeof passreset.resetPassword(), 'function', 'without config');
		buster.assert.equals(typeof passreset.resetPassword({ }), 'function', 'with empty config');
		buster.assert.equals(typeof passreset.resetPassword({ foo: 'bar' }), 'function', 'with invalid config');
		buster.assert.equals(typeof passreset.resetPassword({ next: true }), 'function', 'with valid config');
	},
	
	'simple resetPassword() responses': {
		setUp: function() {
			this.routeFunction  = passreset.resetPassword();
			this.response       = new mockhttp.Response();
		},
		
		'no request body should result in 400 error': testMissingParams(),
		
		'missing token should result in 400 error': testMissingParams(
			{ password: 'goodPassword', confirm: 'goodPassword' }),
		
		'missing password should result in 400 error': testMissingParams(
			{ token: uuid(), confirm: 'goodPassword' }),
		
		'missing confirm should result in 400 error': testMissingParams(
			{ token: uuid(), password: 'goodPassword' }),
		
		'invalid token should result in 401 error': function(done) {
			var req = new mockhttp.Request({
				token: uuid(),
				password: 'goodPassword',
				confirm: 'goodPassword'
			});
			this.response.on('respond', function(res) {
				buster.assert.equals(res.status, 401);
				var response = JSON.parse(res.response);
				buster.assert.equals(response.error.message, 'Request token is invalid');
				done();
			});
			this.routeFunction(req, this.response, function() {
				buster.assert(false, '`next` should not be called in the case of an error');
				done();
			});
		},
			
		'tests with valid request token': {
			setUp: function() {
				this.token = passreset._storage.create(567);
			},
			
			'unmatching passwords should result in a 400 error': function(done) {
				var req = new mockhttp.Request({
					token: this.token,
					password: 'goodPassword1',
					confirm: 'goodPassword2'
				});
				this.response.on('respond', function(res) {
					buster.assert.equals(res.status, 400);
					var response = JSON.parse(res.response);
					buster.assert.equals(response.error.message, 'Password and confirmation do not match');
					done();
				});
				this.routeFunction(req, this.response, function() {
					buster.assert(false, '`next` should not be called in the case of an error');
					done();
				});
			},
			
			'invalid password should result in a 400 error': function(done) {
				var req = new mockhttp.Request({
					token: this.token,
					password: 'short',
					confirm: 'short'
				});
				this.response.on('respond', function(res) {
					buster.assert.equals(res.status, 400);
					var response = JSON.parse(res.response);
					buster.assert.equals(response.error.message, 'Password is too short');
					done();
				});
				this.routeFunction(req, this.response, function() {
					buster.assert(false, '`next` should not be called in the case of an error');
					done();
				});
			},
			
			'valid password and token should result in a 200 OK': function(done) {
				var req = new mockhttp.Request({
					token: this.token,
					password: 'goodPassword',
					confirm: 'goodPassword'
				});
				this.response.on('respond', function(res) {
					buster.assert.equals(res.status, 200);
					buster.assert.equals(res.response, '');
					done();
				});
				this.routeFunction(req, this.response, function() {
					buster.assert(false, '`next` should not be called if opts.next is false/null');
					done();
				});
			}
		}
	}
});

function testMissingParams(body) {
	return function(done) {
		var req = new mockhttp.Request(body);
		this.response.on('respond', function(res) {
			buster.assert.equals(res.status, 400);
			var response = JSON.parse(res.response);
			buster.assert.equals(response.error.message, 'Cannot attempt reset with missing params');
			done();
		});
		this.routeFunction(req, this.response, function() {
			buster.assert(false, '`next` should not be called in the case of an error');
			done();
		});
	};
}

