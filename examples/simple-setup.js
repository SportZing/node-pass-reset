var passreset   = require('pass-reset');
var handlebars  = require('handlebars');

//
// Custom storage models would be initilaized here, but we
// will just use the default memory store
//

//
// Configure the user lookup routine
//
passreset.lookupUsers(function(login, callback) {
	User.find({ username: login }, function(err, users) {
		if (err) {return callback(err);}
		if (! users.length) {return callback(null, false);}
		var user = users[0];
		callback(null, {
			email: user.email,
			users: [{
				id: user.id,
				name: user.username
			}]
		});
	});
});

//
// Configure the set password routine
//
passreset.setPassword(function(id, password, callback) {
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

//
// Configure the send email routine
//
passreset.sendEmail(function(email, resets, callback) {
	var template = handlebars.compile([
		'<p>You requested a password reset for the following account(s).</p>',
		'<ul>',
		'{{#each resets}}',
			'<li>{{name}}: <a href="{{url}}">{{url}}</a></li>',
		'{{/each}}',
		'</ul>'
	].join('\n'));
	mailer.send({
		to: email,
		from: 'noreply@example.com',
		subject: 'password reset',
		body: template({ resets: resets })
	});
	callback(null, true);
});
