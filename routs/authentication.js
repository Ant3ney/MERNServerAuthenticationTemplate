//authentication routs
var express = require("express");
var router = express.Router();
const passport = require("passport");
const passportCofig = require("../config/passport-setup");
const bcrypt = require('bcrypt');
const saltRounds = 10;
var User = require("../models/users");
var utilities = require("../middleware/utilities");
var cors = require('cors');

//Set authentication permissions
var authenticationPermission = {
	google: true,
	facebook: true,
	github: true
}

//Get authentication views
router.get("/login", (req, res) => {
	console.log(req.flash('failureFlash'));
	res.render("authentication/login", {allow: authenticationPermission});
});
router.get("/signup", (req, res) => {
	res.render("authentication/signUp", {allow: authenticationPermission});
});

//Invalid credentials router
router.get("/invalid", (req, res) => {
	req.flash("error", "username or password is invalid");
	res.redirect("/login");
});

//Local sign up
router.post("/signup", (req, res, next) => {
	//geting credentials from view form
	var email = req.body.email;
	var name = req.body.name;
	var password = req.body.password;
	
	//Check if user exzists
	User.find({}, (err, users) => {
		//loop through all users and find out if incoming is dupe
		var dupeUserIndex = utilities.findIndexOfLocalUser(users, email);
		
		//if email already exzists
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
				User.create(utilities.assembleLocalUser(email, name, hash), (err, user) => {
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
}, (req, res, next) => {
		passport.authenticate('local', (err, user) => {
			if(err || !user){
				console.log('Something went wrong in sign-up route after authenticating');
				console.log(err.message);
				res.status(400).json({
					message: err.message + (user ? '' : '\n No User is present')
				});
			}
			else{
				req.login(user, err => {
					if(err){
						console.log('Something went wrong after trying to login newly created user');
						console.log(err.message);
					}
					res.status(200).json({
						name: user.name,
						email: user.email
					});
				})
				
			}
		})(req, res, next);
	}
);

router.get('/isLoggedIn', (req, res, next) => {
	if(req.isAuthenticated())
	{
		res.status(200).json({
			loggedIn: true
		});
	}
	else{
		res.status(200).json({
			loggedIn: false
		});
	}
});

router.get("/getProfile", (req, res) => {
	if(req.isAuthenticated()){
		let user = req.user;
		res.status(200).json({
			loggedIn: true,
			user: user
		});
	}
	else{
		res.status(200).json({
			loggedIn: false
		});
	}
});

//local login
router.post("/login", (req, res, next) => {
	passport.authenticate('local', (err, user) => {
		if(err || !user){
			console.log('Login faild because ' + (err ? err.message : '') + (!user ? '\n There is no user' : ''));
			res.status(400).json({
				message: 'Login faild because ' + (err ? err.message : '') + (!user ? '\n There is no user' : '')
			});
		}
		else{
			req.login(user, err => {
				res.status(200).json({
					loggedIn: true,
					user: user
				});
			});
		}
	})(req, res, next);
});

//auththentication logout
router.get("/logout", (req, res) => {
	console.log("User logged out");
	 req.logout();
	 res.status(200).json({message: 'Logged out'});
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
router.get("/google/redirect", passport.authenticate("google", {
   failureRedirect: '/invalid',
   failureFlash: true
}), (req, res) => {
	req.flash("authentication", "You have successfull logged in as " + req.user.name);
	res.redirect("/");
});

//Authentication with google - End

//Authentication with facebook - Start

//Sign up with facebook
router.get("/register/facebook", (req, res) => {
	//handle app logic before authenticating
	res.redirect("/auth/facebook");
});

//Login with facebook
router.get("/login/facebook", (req, res) => {
	//handle app login logic here
	res.redirect("/auth/facebook");
});

//Authenticate with facebook
router.get('/auth/facebook',
  passport.authenticate('facebook'));
router.get("/facebook/redirect", passport.authenticate("facebook", {
   failureRedirect: '/invalid',
   failureFlash: true
}), (req, res) => {
	req.flash("authentication", "You have successfull logged in as " + req.user.name);
	res.redirect("/");
});

//Authentication with facebook - End

//Authentication with github - Start

//login with github
router.get("/login/github", (req, res) => {
	//handle app login logic here
	res.redirect("/auth/github");
});

//Sign up with github
router.get("/register/github", (req, res) => {
	//handle app sign up logic here
	res.redirect("/auth/github");
});

//Authenticate with github
router.get('/auth/github', passport.authenticate('github'));
router.get('/github/redirect', 
  passport.authenticate('github', {
   failureRedirect: '/invalid',
   failureFlash: true
}),
  function(req, res) {
    // Successful authentication, redirect home.
	req.flash("authentication", "You have successfull logged in as " + req.user.name);
    res.redirect('/');
  });

//Authentication with github - End

module.exports = router;