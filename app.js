var express = require("express"),
app = express();

//ENV setup
require('dotenv').config();

//Declaring varibles
var bodyParser = require("body-parser"),
	passportSetup = require("./config/passport-setup"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	User = require("./models/users"),
	expressSession = require("express-session")

//passport setup
app.use(expressSession({
	secret: "Login app",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
 	done(null, user);
});

//app.use
app.use((req, res, next) => {
	//populate req.app.loacls with app info
	req.app.locals.currentUser = req.user;

	res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

//connecting mongoose
mongoose.connect(process.env.DBURL, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
}).then(() => {
	console.log("MongoDB has concected!");
	//Remove all users
	User.remove({}, (err) => {
		if(err){
			console.log("Something went wrong");
			console.log(err.message);
		}
		else{
			console.log("all users have been deleted");
			User.find({}, (err, users) => {
				console.log(users);
			});
		}
	});

}).catch((err) => {
	console.log("Something went wrong");
	console.log(err.message);
});

//Handling routs
//route file locations
var authenticationRouts = require("./routs/authentication"),
	indexRouts = require("./routs/index");
//using routs files
app.use(authenticationRouts);
app.use(indexRouts);

//app setings
app.set("view engine", "ejs");

app.listen(process.env.PORT || 3000, process.env.IP, () => {
	console.log("Server has started!");
});