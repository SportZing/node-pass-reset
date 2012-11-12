
var passreset = require('pass-reset');

app.post('/password/reset',
	passreset.requestResetToken({
		callbackURL: 'http://www.example.com/password/reset/{token}'
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
