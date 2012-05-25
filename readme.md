# Password Reseting Module

## Install

```bash
$ npm install pass-reset
```

## Configuration

```javascript
var passReset = require('pass-reset');

// Example user lookup routine
passReset.lookupUser(function(login, callback) {
	User.findOne({ username: login }, function(err, user) {
		if (err) {return callback(err);}
		if (! user) {return callback(null, false);}
		callback(null, {
			id: user.id,
			name: user.username,
			email: user.email
		});
	});
});

// Example set password routine
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

// Example send email routine
passReset.sendEmail(function(email, resets, callback) {
	var template = handlebars.compile([
		'<p>You requested a password reset for the following account(s).</p>',
		'<ul>',
		'{{#each resets}}',
			'<li>{{name}}: <a href="{{url}}">{{url}}</a></li>',
		'{{/each}}',
		'</ul>'
	].join('\n'));
	resets = resets.map(function(reset) {
		reset.url = 'http://example.com/password/reset/' + reset.token;
		return reset;
	});
	mailer.send({
		to: email,
		from: 'noreply@example.com',
		subject: 'password reset',
		body: template(resets)
	});
	callback(null, true);
});
```















