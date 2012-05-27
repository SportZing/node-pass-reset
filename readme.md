# pass-reset

An _express_ compatable module for creating RESTful password reset endpoints.

## Install

```bash
$ npm install pass-reset
```

## Configuration

##### Example expiration

```javascript
var passReset = require('pass-reset');

// The unit (second param) can be one of the following (or undefined for milliseconds):
//   "secs", "mins", "hours", "days", or "weeks"
passReset.expireTimeout(12, 'hours');
```

##### Example user lookup routine

```javascript
var passReset = require('pass-reset');

passReset.lookupUsers(function(login, callback) {
	User.find({ username: login }, function(err, users) {
		if (err) {return callback(err);}
		if (! users.length) {return callback(null, false);}
		callback(null, {
			email: user.email,
			users: [{
				id: user.id,
				name: user.username
			}]
		});
	});
});
```

##### Example set password routine

```javascript
var passReset = require('pass-reset');

passReset.setPassword(function(id, password, callback) {
	if (password.length < 8) {
		return callback(null, false, 'Password must be at least 8 characters');
	}
	var hash = doHash(password);
	var update = { $set: { password: hash } };
	User.update({ id: id }, update, { }, function(err) {
		if (err) {return callback(err);}
		callback(null, true);
	});
});
```

##### Example send email routine

```javascript
var passReset = require('pass-reset');

var template = handlebars.compile([
	'<p>You requested a password reset for the following account(s).</p>',
	'<ul>',
	'{{#each resets}}',
		'<li>{{name}}: <a href="{{url}}">{{url}}</a></li>',
	'{{/each}}',
	'</ul>'
].join('\n'));

passReset.sendEmail(function(email, resets, callback) {
	mailer.send({
		to: email,
		from: 'noreply@example.com',
		subject: 'password reset',
		body: template({ resets: resets })
	});
	callback(null, true);
});
```

## Usage

##### Route for requesting a new reset token

```javascript
app.post('/password/reset',
	passReset.requestResetToken()
);
```

The `requestResetToken` method can also take an object of configuration values. The following values are supported:

* __loginParam__ - The name of the param where the login data (username/email) can be found in `req.body`.
* __callbackURL__ - The base URL to direct users to actually perform the reset. This value should contain a `"{token}"` somewhere which will be replaced with the token, eg. `"/password/reset/{token}"`.
* __next__ - By default, when pass-reset is done generating a token and sending it, an empty 200 OK response will be sent. To change this behavior, this value can be given a few different values. If a string is given, it is treated as a redirect, if a function is given, it will be called with the `req`, `res`, and `next` parameters, and if any other truthy value is given, the `next` function will simply be called.

```javascript
app.post('/password/reset',
	passReset.requestResetToken({
		next: true,
		loginParam: 'login',
		callbackURL: '/password/reset/{token}',
	}),
	function(req, res) {
		// ...
	}
);
```

##### Route for actually reseting passwords

```javascript
app.put('/password/reset',
	passReset.resetPassword()
);
```

The `resetPassword` method can also take an object of configuration values. The following values are supported:

* __tokenParam__/__passwordParam__/__confirmParam__ - The name of the params where the respective data (token/password/confirm) can be found in `req.body`.
* __next__ - By default, after the password is reset, an empty 200 OK response will be sent. To change this behavior, this value can be given a few different values. If a string is given, it is treated as a redirect, if a function is given, it will be called with the `req`, `res`, and `next` parameters, and if any other truthy value is given, the `next` function will simply be called.

```javascript
app.put('/password/reset',
	passReset.resetPassword({
		next: true,
		tokenParam: 'token',
		passwordParam: 'password',
		confirmParam: 'confirm'
	}),
	function(req, res) {
		// ...
	}
);
```

