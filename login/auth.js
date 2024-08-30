const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Home = require('../models/homes');
const router = express.Router();
const session			= require('express-session');
const passport			= require('passport');
const localStrategy		= require('passport-local').Strategy;
const bcrypt			= require('bcrypt');
const flash = require('connect-flash');


// Passport.js
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 
// parse application/json
app.use(bodyParser.json());                        

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
	secret: "adamnfinesecret",
	resave: false,
	saveUninitialized: true
}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	Home.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new localStrategy(function (username, password, done) {
    console.log('checking user...')
	Home.findOne({'users': {$elemMatch: {name: username}}}, function (err, user) {
		

		  
		if (err) return done(err);
		if (!user) return done(null, false, { message: 'Incorrect username.' });
		
		let loginUser = user.users.find( ({ name }) => name === username );
		console.log(loginUser) 

		bcrypt.compare(password, loginUser.password, function (err, res) {
			if (err) return done(err);
			if (res === false) return done(null, false, { message: 'Incorrect password.' });
			
			return done(null, loginUser);
		});
	});
}));


// router.post('/login', passport.authenticate('local'),  function (req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.json({user:req.user});
// });


router.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
	  if (err) { return next(err); }

	  if (!user) { return res.json({error:info}); }

	  req.logIn(user, function(err) {

		if (err) { return next(err); }

		return res.json({user:user});

	  });
	})(req, res, next);
  });
  


// Setup a qualified user
app.get('/setup', async (req, res) => {
	// const exists = await User.exists({ username: "admin" });

	// if (exists) {
	// 	res.redirect('/login');
	// 	return;
	// };


});



function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/login');
}

function isLoggedOut(req, res, next) {
	if (!req.isAuthenticated()) return next();
	res.redirect('/');
}


// app.post('/login', passport.authenticate('local'), function(req, res){
// 	console.log("passport user", req.user);
//   });
  

router.get('/login',(req,res)=>{
    res.json({
        message: "Let's log you in",
      });
});
 

// app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {

//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     // Then you can send your json as response.
//     res.json({message:"Success", username: req.user.username});
//   });


app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});


router.get('/sign-up',(req,res)=>{
    res.json({
        message: "Let's sign you in",
      });
});


router.get('/submit-home', (req,res) => {

	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash("pass", salt, function (err, hash) {
			if (err) return next(err);
			
		const newHome = new Home({
				rooms:[
          {
            name:'studio',
            light:0,
            ac:0,
            gas:1,
            temp:1,
            voltage:0,
            amps:0
          },
        ],
        users:[
          {
            name:'Sally',
            email:'sally@patientsknowsbest.com',
            password: hash,
            phone:'1144777855',
            image:'https://placeholder.com/cat.png'
          },
        ]
			});


  newHome.save()
      .then((results) => {
        res.json({
          user: results,
        });
      
      })
      .catch((err) => {
        console.log(err);
      });

    	});
	});

  // const home = new Home(req.body);

  // home.save()
  //     .then((results) => {
  //       res.send(results)
  //       console.log('data has been sent')
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });


});     

module.exports  = router;
