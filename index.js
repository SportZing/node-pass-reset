/**
 * Password reset module
 *
 * @author     James Brumond
 */

var uuid = require('uuid-v4');

/**
 * Stored requests that have not yet been fulfilled
 */
var storage = (function() {
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
	secs:  1000,
	mins:  1000 * 60,
	hours: 1000 * 60 * 60,
	days:  1000 * 60 * 60 * 24,
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
};

/**
 * User lookup routine
 *
 * Should result in an object containing a unique id and email.
 */
var lookupUser = function(login, callback) {
	callback(null, null); 
};
exports.lookupUser = function(func) {
	if (typeof func === 'function') {
		lookupUser = func;
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
 *
 * TODO Needs to be able to handle multiple accounts with one email
 */
exports.requestResetToken = function(opts) {
	opts = merge({
		error: null,
		success: null,
		loginParam: 'login',
		callbackURL: '/password/reset/%s'
	}, opts);
	return function(req, res, next) {
		var fail = getFailer(opts, req, res, next);
		var login = req.body[opts.loginParam];
		if (! login) {return fail();}
		lookupUser(login, function(err, user) {
			if (err) {return fail();}
			
		});
	};
};

exports.resetPassword = function(opts) {
	opts = merge({
		error: null,
		success: null,
		tokenParam: 'token',
		passwordParam: 'password',
		confirmParam: 'confirm'
	}, opts);
	return function(req, res, next) {
		var fail = getFailer(opts, req, res, next);
		
	};
};







// ------------------------------------------------------------------
//  Utilities

function getFailer(opts, req, res, next) {
	return function() {
		if (typeof opts.error === 'string') {
			res.redirect(opts.error);
		} else if (typeof opts.error === 'function') {
			opts.error(req, res, next);
		} else {
			next();
		}
	};
}

function merge(host) {
	host = isMutable(host) ? host : { };
	for (var i = 1, c = arguments.length; i < c; i++) {
		if (isMutable(arguments[i])) {
			Object.keys(arguments[i]).forEach(function(prop) {
				host[prop] = arguments[i][prop];
			});
		}
	}
	return host;
}

function isMutable(value) {
	return (typeof value === 'object' && value) || typeof value === 'function';
}

/* End of file index.js */
