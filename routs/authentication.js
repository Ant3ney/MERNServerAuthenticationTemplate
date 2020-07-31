//authentication routs
var express = require("express");
var router = express.Router();
const passport = require("passport");
const passportCofig = require("../config/passport-setup");
const bcrypt = require('bcrypt');
const saltRounds = 10;
var User = require("../models/users");
var utilities = require("../middleware/utilities");

//Get authentication views
router.get("/login", (req, res) => {
	res.render("authentication/login");
});
router.get("/signup", (req, res) => {
	res.render("authentication/signUp");
});

//Local sign up
router.post("/signup", (req, res, next) => {
	//geting credentials from view form
	var username = req.body.username;
	var name = req.body.namefeild;
	var password = req.body.password;
	
	//Check if user exzists
	User.find({}, (err, users) => {
		//loop through all users and find out if incoming is dupe
		var dupeUserIndex = utilities.findIndexOfLocalUser(users, username);
		
		//if username already exzists
		if(dupeUserIndex >= 0){
			console.log("User already exzists");
			next();
		}
		
		//create new user
		else{
			console.log("New local user created");
			
			//hashing password
			bcrypt.hash(password, saltRounds, (err, hash) => {
				//Create user
				User.create(utilities.assembleLocalUser(username, name, hash), (err, user) => {
					if(err){
						console.log("Something went wrong");
						console.log(err.message);
					}
					else{
						console.log("Created new local user");
						next();
					}
				});
			});
		}
	});
}, passport.authenticate('local', { 
		successRedirect: '/',
		failureRedirect: '/login'
	})
);

//local login
router.post("/login", passport.authenticate('local', { 
		successRedirect: '/',
   		failureRedirect: '/login'
		})
);

//auththentication logout
router.get("/logout", (req, res) => {
	console.log("User logged out");
 	req.logout();
 	res.redirect('/');
});

//Authentication with google - Start

//Sign up with google
router.get("/register/google", (req, res) => {
	//handle app logic before authenticating
	res.redirect("/auth/google");
});

//Login with google
router.get("/login/google", (req, res) => {
	//handle app login logic here
	res.redirect("/auth/google");
});

//Authenticate with google
router.get("/auth/google", passport.authenticate("google", {
	scope: ["profile"]
}));
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
	res.redirect("/");
});

//Authentication with google - End

module.exports = router;