/**
 * Password reset module
 *
 * @author     James Brumond
 */

var util  = require('util');
var uuid  = require('uuid-v4');

/**
 * Stored requests that have not yet been fulfilled
 */
var storage = exports._storage = (function() {
	var tokens = { };
	return {
		create: function(id) {
			var token = uuid();
			tokens[token] = {
				id: id,
				timer: setTimeout(
					function() {
						storage.destroy(token);
					},
					expireTimeout
				)
			};
			return token;
		},
		lookup: function(token) {
			if (tokens[token]) {
				return tokens[token].id;
			}
		},
		destroy: function(token) {
			if (tokens[token]) {
				clearTimeout(tokens[token].timer);
				delete tokens[token];
			}
		}
	};
}());

/**
 * Set the expire timeout
 *
 * Defaults to 43200000, or 12 hours
 */
var timeoutUnits = {
	sec:   1000,
	secs:  1000,
	min:   1000 * 60,
	mins:  1000 * 60,
	hour:  1000 * 60 * 60,
	hours: 1000 * 60 * 60,
	day:   1000 * 60 * 60 * 24,
	days:  1000 * 60 * 60 * 24,
	week:  1000 * 60 * 60 * 24 * 7,
	weeks: 1000 * 60 * 60 * 24 * 7
};
var expireTimeout = 43200000;
exports.expireTimeout = function(num, unit) {
	if (typeof num === 'number' && ! isNaN(num)) {
		var multiplier = 1;
		if (unit && timeoutUnits.hasOwnProperty(unit)) {
			multiplier = timeoutUnits[unit];
		}
		expireTimeout = num * multiplier;
	}
	return expireTimeout;
};

/**
 * User lookup routine
 *
 * Should result in an array of objects containing a unique id and email.
 */
var lookupUsers = function(login, callback) {
	callback(null, null); 
};
exports.lookupUsers = function(func) {
	if (typeof func === 'function') {
		lookupUsers = func;
	}
};

/**
 * Password setting routine
 *
 * Should take a unique id (as returned from the user lookup
 * routine) and a new password.
 */
var setPassword = function(id, password, callback) {
	callback(null, false, null);
};
exports.setPassword = function(func) {
	if (typeof func === 'function') {
		setPassword = func;
	}
};

/**
 * Email sending routine
 *
 * Should take an email address and tokens.
 */
var sendEmail = function(email, resets, callback) {
	callback(null, false);
};
exports.sendEmail = function(func) {
	if (typeof func === 'function') {
		sendEmail = func;
	}
};

/**
 * The route that takes reset requests
 *
 * eg. POST /password/reset
 */
exports.requestResetToken = function(opts) {
	opts = merge({
		next: null,
		loginParam: 'login',
		callbackURL: '/password/reset/{token}'
	}, opts);
	var func = function(req, res, next) {
		var login = req.body ? req.body[opts.loginParam] : null;
		if (! login) {
			return res.json(jsonError('No login given'), 400);
		}
		lookupUsers(login, function(err, users) {
			if (err) {
				return res.json(jsonError(err), 500);
			}
			if (! users) {
				return res.json(jsonError('No such user'), 404);
			}
			users.users = users.users.map(function(user) {
				var token = storage.create(user.id);
				return {
					token: token,
					name: user.name,
					url: opts.callbackURL.replace('{token}', token)
				};
			});
			sendEmail(users.email, users.users, function(err, sent) {
				if (err) {
					return res.json(jsonError(err), 500);
				}
				if (! opts.next) {
					return res.send(200);
				}
				if (typeof opts.next === 'string') {
					res.redirect(opts.next);
				} else if (typeof opts.next === 'function') {
					opts.next(req, res, next);
				} else {
					next();
				}
			});
		});
	};
	func._opts = opts;
	return func;
};

/**
 * The route that actually does resets
 *
 * eg. PUT /password/reset
 */
exports.resetPassword = function(opts) {
	opts = merge({
		next: null,
		tokenParam: 'token',
		passwordParam: 'password',
		confirmParam: 'confirm'
	}, opts);
	var func = function(req, res, next) {
		var params = req.body ? {
			token: req.body[opts.tokenParam],
			password: req.body[opts.passwordParam],
			confirm: req.body[opts.confirmParam]
		} : { };
		if (! params.token || ! params.password || ! params.confirm) {
			return res.json(jsonError('Cannot attempt reset with missing params'), 400);
		}
		var id = storage.lookup(params.token);
		if (! id) {
			return res.json(jsonError('Request token is invalid'), 401);
		}
		if (params.password !== params.confirm) {
			return res.json(jsonError('Password and confirmation do not match'), 400);
		}
		setPassword(id, params.password,
			function(err, success, validationError) {
				if (err) {
					return res.json(jsonError(err), 500);
				}
				if (! success) {
					return res.json(jsonError(validationError), 400);
				}
				storage.destroy(params.token);
				if (! opts.next) {
					return res.send(200);
				}
				if (typeof opts.next === 'string') {
					res.redirect(opts.next);
				} else if (typeof opts.next === 'function') {
					opts.next(req, res, next);
				} else {
					next();
				}
			}
		);
	};
	func._opts = opts;
	return func;
};

// ------------------------------------------------------------------
//  Utilities

function jsonError(msg) {
	if (msg instanceof Error) {
		msg = {
			type: msg.type,
			message: msg.message,
			stack: msg.stack,
			stackArray: msg.stack.split('\n').slice(1).map(function(str) {
				return str.trim();
			})
		};
	} else {
		msg = {message: msg};
	}
	return {error: msg};
}

function merge(host) {
	host = isMutable(host) ? host : { };
	Array.prototype.slice.call(arguments, 1).forEach(function(arg) {
		if (isMutable(arg)) {
			Object.keys(arg).forEach(function(prop) {
				host[prop] = arg[prop];
			});
		}
	});
	return host;
}

function isMutable(value) {
	return (typeof value === 'object' && value) || typeof value === 'function';
}

/* End of file index.js */
