
var _storage;

var uuid       = require('uuid-v4');
var passreset  = require('./index');

exports.create = function(id, callback) {
	callback = callback || noop;

	var token = uuid();

	// Async
	if (_storage.create.length > 2) {
		_storage.create(id, token, function(err) {
			callback(err, token);
		});
	}

	// Sync
	else {
		try {
			_storage.create(id, token);
		} catch (err) {
			return callback(err);
		}
		callback(null, token);
	}
};

exports.lookup = function(token, callback) {
	callback = callback || noop;

	// Async
	if (_storage.lookup.length > 1) {
		_storage.lookup(token, callback);
	}

	// Sync
	else {
		var id;
		try {
			id = _storage.lookup(token);
		} catch (err) {
			callback(err);
		}
		callback(null, id);
	}
};

exports.destroy = function(token, callback) {
	callback = callback || noop;

	// Async
	if (_storage.destroy.length > 1) {
		_storage.destroy(token, callback);
	}

	// Sync
	else {
		try {
			var id = _storage.destroy(token);
		} catch (err) {
			callback(err);
		}
		callback(null);
	}
};

// -------------------------------------------------------------

exports.setStore = function(store) {
	_storage = store;
};

// -------------------------------------------------------------

exports.MemoryStore = function() {
	var self = this;
	var tokens = { };

	this.create = function(id, token) {
		tokens[token] = {
			id: id,
			timer: setTimeout(
				function() {
					self.destroy(token);
				},
				passreset.expireTimeout()
			)
		};
		return token;
	};

	this.lookup = function(token) {
		if (tokens[token]) {
			return tokens[token].id;
		}
	};

	this.destroy = function(token) {
		if (tokens[token]) {
			clearTimeout(tokens[token].timer);
			delete tokens[token];
		}
	};
};

// -------------------------------------------------------------

function noop() {
	// pass
}
