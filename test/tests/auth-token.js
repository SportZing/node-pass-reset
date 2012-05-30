
var buster     = require('buster');
var uuid       = require('uuid-v4');
var passreset  = require('../../lib');

buster.testCase('Authentication Token Storage', {
	'create/lookup/destroy': {
		setUp: function() {
			this.id     = Math.ceil(Math.random() * 20);
			this.token  = passreset._storage.create(this.id);
		},
		
		'token should be a valid v4 uuid': function() {
			buster.assert(uuid.isUUID(this.token));
		},
	
		'token lookup should result in the stored id': function() {
			buster.assert.equals(passreset._storage.lookup(this.token), this.id);
		},
	
		'token destroy should invalidate token': function() {
			passreset._storage.destroy(this.token);
			buster.refute(passreset._storage.lookup(this.token));
		}
	},
	
	'token should expire automatically after timeout': function(done) {
		passreset.expireTimeout(100);
		var id = Math.ceil(Math.random() * 20);
		var token = passreset._storage.create(id);
		buster.assert.equals(passreset._storage.lookup(token), id);
		setTimeout(function() {
			buster.refute(passreset._storage.lookup(token));
			done();
		}, 150);
	}
});

