var https = require("https");
var admin = require('firebase-admin');
var express = require("express");
var app = express();

var server = require('http').Server(app);
var localhost = "127.0.0.1";

var serviceAccount = require('./serviceAccountKey.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fir-test-80556.firebaseio.com'
});

var db = admin.database();

server.listen(8080, localhost, function () {
    console.log("Server Started...");
})

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(allowCrossDomain);

app.get("/verifyDocument", function (request, response) {
    console.log("verifyDocument Called.");

    var isVerified = request.query.verifyValue;

    var verifierEmail = request.query.verifierEmail;

    admin.auth().getUserByEmail(verifierEmail)
        .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully fetched user data:", userRecord.toJSON());

            var verifierId = userRecord.uid;

            var societyIsVerifiedRef = db.ref("Society_Register_Data/" + verifierId);

            societyIsVerifiedRef.child("isVerified").set(isVerified);

            response.status(200).send({"status": "Verified"});
            
        })
        .catch(function (error) {
            console.log("Error fetching user data:", error);
        });
})
