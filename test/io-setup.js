
var events     = require('events');
var passreset  = require('../lib');

module.exports = exports = new events.EventEmitter();

passreset.lookupUsers(function(login, callback) {
	callback = async(callback);
	switch (login) {
		case 'valid':
			callback(null, {
				email: 'foo1@example.com',
				users: [{
					id: 123,
					name: 'foo'
				}]
			});
		break;
		case 'multivalid':
			callback(null, {
				email: 'foo2@example.com',
				users: [{
					id: 234,
					name: 'bar'
				}, {
					id: 345,
					name: 'baz'
				}]
			});
		break;
		case 'invalid':
			callback(null, false);
		break;
		default:
			callback('Invalid test login given');
		break;
	}
});

passreset.sendEmail(function(email, resets, callback) {
	exports.emit('sendEmail', email, resets);
	async(callback)(null, true);
});

passreset.setPassword(function(id, password, callback) {
	callback = async(callback);
	switch (password) {
		case 'short':
			callback(null, false, 'Password is too short');
		break;
		case 'goodPassword':
			callback(null, true);
		break;
		default:
			callback('Invalid test password given');
		break;
	}
});

function async(func) {
	return function() {
		var args = arguments;
		process.nextTick(function() {
			func.apply(this, args);
		});
	};
}

