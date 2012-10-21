
var _storage;

/**
 * Storage interface
 */
exports.create = function(id, callback) {
	callback = callback || noop;
	// Takes callback
	if (_storage.create.length > 1) {
		_storage.create(id, callback);
	}
	// Returns result
	else {
		callback(_storage.create(id));
	}
};

this.lookup = function(id, callback) {
	callback = callback || noop;
	// Takes callback
	if (_storage.create.length > 1) {
		_storage.create(id, callback);
	}
	// Returns result
	else {
		callback(_storage.create(id));
	}
};

this.destroy = function(id, callback) {
	callback = callback || noop;
	// Takes callback
	if (_storage.create.length > 1) {
		_storage.create(id, callback);
	}
	// Returns result
	else {
		callback(_storage.create(id));
	}
};

exports.setStore = function(store) {
	_storage = store;
};

exports.MemoryStore = function() {
	var self = this;
	var tokens = { };

	this.create = function(id) {
		var token = uuid();
		tokens[token] = {
			id: id,
			timer: setTimeout(
				function() {
					self.destroy(token);
				},
				expireTimeout
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

function noop() {
	// pass
}
