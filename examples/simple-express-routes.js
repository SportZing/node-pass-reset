
var passreset = require('pass-reset');

app.post('/password/reset',
	passreset.requestResetToken({
		callbackURL: 'http://www.example.com/password/reset/{token}',

		// If this function is given you can handle errors yourself. Otherwise,
		// errors will be sent automatically in a JSON format
		error: function(err, status, req, res) {
			res.send(status, err);
		},

		// If the "next" option is given, the action taken after successful
		// request can be controled. A string will be treated as a redirect URL,
		// and if a function is given it will be called after the request is
		// processed. Otherwise, a simple JSON {status: 'OK'} will be sent.
		next: function(req, res) {
			res.send(200, 'Yay!');
		}
	});
);

app.get('/password/reset/:token', function() {
	//
	// Render a form here that takes the token (which should be auto-generated in the form)
	// and a new password/confirmation, something like the following would work:
	//
	//   <form action="/password/reset">
	//     <input type="hidden" name="token" value="{{ token }}" />
	//     <input type="password" name="password" value="" placeholder="Password" />
	//     <input type="password" name="confirm" value="" placeholder="Confirm Password" />
	//   </form>
	//
	// In this example the form would have to be submitted with AJAX because the reset route
	// below takes a PUT. If you want the form to work with HTML only you can use a POST with
	// a different route URI or some kind of method override.
	//
});

app.put('/password/reset',
	passreset.resetPassword()
);
