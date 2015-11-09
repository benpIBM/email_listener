/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var sendgrid  = require('sendgrid')('perlmutt@us.ibm.com', 'demoPass12345');

// Load the Cloudant library.
var Cloudant = require('cloudant');

var follow = require('follow');

var follow_db_name = 'books';

var me = 'bsp'; // Set this to your own account
var password = 'demoPass';

// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password});

follow_db = null;

follow_db = cloudant.db.use(follow_db_name);

follow({db:'https://bsp:demoPass@bsp.cloudant.com/'+follow_db_name, include_docs:true}, function(error, change) {
	if (!error) {
		if(change.doc.to_email_address) {
    		if(change.doc.from_email_address){
    			var from_email_address = change.doc.from_email_address;
    		}
    		if(change.doc.email_subject) {
    			var email_subject = change.doc._id + ' ' + change.doc.email_subject;
    		}
    		var to_email_address = change.doc.to_email_address;
    		var email_text = change.doc.email_text;
    		if(change.doc.geometry) {
    			lon = change.doc.geometry.coordinates[0];
    			lat = change.doc.geometry.coordinates[1];
    		}
    		email_text = email_text + ' lat: ' + lat + ', long: ' + lon;
    		// email_text = (email_text.split(" ")).join("%20");
    		// email_subject = (email_subject.split(" ")).join("%20");
    		var sendGridEmail   = new sendgrid.Email({
    			to: to_email_address,
    			from: from_email_address,
    			subject: email_subject,
    			text: email_text
    		});
    		sendgrid.send(sendGridEmail, function(err, json) {
    			if (err) { 
    				console.error(err); 
    			}
    			console.log(json);
    		});
    	}
    }
});

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
