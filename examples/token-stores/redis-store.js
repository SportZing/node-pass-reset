
var passreset  = require('pass-reset');
var redis      = require('redis-url');

function RedisStore(url) {
	this.client = reqis.connect(url);
}

RedisStore.prototype.create = function(id, token, callback) {
	this.client.set(token, id, callback);
	this.client.expire(token, Math.round(passReset.expireTimeout() / 1000));
};

RedisStore.prototype.lookup = function(token, callback) {
	this.client.get(token, callback);
};

RedisStore.prototype.destroy = function(token, callback) {
	this.client.del(token, callback);
};

passreset.setStore(new RedisStore('redis://...'));
