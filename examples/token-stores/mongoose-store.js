var passreset  = require('pass-reset');
var mongoose   = require('mongoose');

function MongooseStore(host, db) {
	this.client = mongoose.createConnection(host, db);
	this.client.once('open', this.init.bind(this));
}

MongooseStore.prototype.init = function() {
	// Build the schema/model for token storage
	var schema = new mongoose.Schema({
		key: String,
		token: String,
		expires: {
			type: Date,
			default: function() {
				return new Date(Date.now() + passreset.expireTimeout());
			}
		}
	});
	this.PassResetToken = db.model('PassResetToken', schema);

	// Check for expired tokens periodically and remove them
	setInterval(function() {
		var expired = {expires: {'$lte': new Date}};
		this.PassResetToken.remove(expired).exec();
	}.bind(this));
};

MongooseStore.prototype.create = function(id, token, callback) {
	(new this.PassResetToken({key: id, token: token})).save(callback);
};

MongooseStore.prototype.lookup = function(token, callback) {
	this.PassResetToken.findOne({token: token}, function(err, token) {
		if (err) {
			return callback(err);
		}
		// Not found
		if (! token) {
			return callback(null, false);
		}
		// Expired
		if (Date.now() > token.expired) {
			token.remove();
			return callback(null, false);
		}
		// Good token found
		callback(null, token.key);
	});
};

MongooseStore.prototype.destroy = function(token, callback) {
	this.PassResetToken.remove({token: token}, callback);
};

passreset.storage.setStore(new MongooseStore('localhost', 'test'));
