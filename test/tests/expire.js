
var buster     = require('buster');
var passreset  = require('../../lib');

buster.testCase('Token Expiration Configuration', {
	'a non-number value should not change expire': function() {
		var orig = passreset.expireTimeout();
		buster.assert.equals(passreset.expireTimeout('foo'), orig);
	},
	
	'a single argument should set milliseconds': function() {
		buster.assert.equals(passreset.expireTimeout(100), 100);
	},
	
	'using "sec"/"secs" unit should store in seconds': function() {
		buster.assert.equals(passreset.expireTimeout(1.5, 'sec'), 1500);
		buster.assert.equals(passreset.expireTimeout(1.5, 'secs'), 1500);
	},
	
	'using "min"/"mins" unit should store in minutes': function() {
		buster.assert.equals(passreset.expireTimeout(1.5, 'min'), 90000);
		buster.assert.equals(passreset.expireTimeout(1.5, 'mins'), 90000);
	},
	
	'using "hour"/"hours" unit should store in hours': function() {
		buster.assert.equals(passreset.expireTimeout(1.5, 'hour'), 5400000);
		buster.assert.equals(passreset.expireTimeout(1.5, 'hours'), 5400000);
	},
	
	'using "day"/"days" unit should store in days': function() {
		buster.assert.equals(passreset.expireTimeout(1.5, 'day'), 129600000);
		buster.assert.equals(passreset.expireTimeout(1.5, 'days'), 129600000);
	},
	
	'using "week"/"weeks" unit should store in weeks': function() {
		buster.assert.equals(passreset.expireTimeout(1.5, 'week'), 907200000);
		buster.assert.equals(passreset.expireTimeout(1.5, 'weeks'), 907200000);
	}
});

