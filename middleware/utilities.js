//Location to store helper functions needed around the app
var middle = {};
var express = require("express");
var app = express();

//create new local user
middle.assembleLocalUser = (email, name, hash) => {
	var newUser = {
		username: name,
		name: name,
		id: null,
		password: hash,
		type: "local",
		email: email
	}
	
	return newUser;
}

//loop though users and find matching local username
middle.findIndexOfLocalUser = (users, email) => {
	var correctUserIndex = -1;
	
	//loop through and find index of user with correct username
	for(var i = 0; i < users.length; i++){
		if(users[i].type === "local" && users[i].email === email){
			correctUserIndex = i;
			break;
		}
	}
	
	return correctUserIndex;
}

middle.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated())
	{
		return next();
	}
	else{
		res.status(401);
	}

}

//loop through users and find one with matching google id
middle.findIndexOfOAuthUser = function(users, profile){
	var returnVal = -1;
	users.forEach((user, i) => {
		if(user.id && user.id.toString() == profile.id.toString()){
			returnVal = i;
		}
	});
	return returnVal;
}

//Create new user object
middle.assembleOAuthUser = function(profile, type){
	var user = {
		username: profile.displayName,
		name: profile.displayName,
		id: profile.id,
		password: "null",
		type: type
	};
		
	return user
}

//Create new user object
middle.assembleGithubUser = function(profile, type){
	var user = {
		username: profile.username,
		name: profile.username,
		id: profile.id,
		password: "null",
		type: type
	};
		
	return user
}

module.exports = middle;