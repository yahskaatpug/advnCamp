var express    = require("express"),
    router     = express.Router(),
    passport   = require("passport"),
    User       = require("../models/user");
    var Nexmo = require('nexmo');
    var nexmo = new Nexmo({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET
    });
//============
// AUTH ROUTE
//============

// root route
router.get("/",function(req, res){
   res.render("landing");
});

// show register form
router.get("/register", function(req, res){
    res.render("register");
});

// handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    var phoneNumber = req.body.number;
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            // req.flash("success", "Welcome to YelpCamp " + user.username);
            
        console.log(phoneNumber);
        nexmo.verify.request({number: phoneNumber, brand: 'Awesome Company'}, (err, 
        result) => {
        if(err) {
        res.sendStatus(500);
        }  else {
        var requestId = result.request_id;
        if(result.status == '0') {
            res.render('verify', {requestId: requestId}); // Success! Now, have your user enter the PIN
        } else {
            res.status(401).send(result.error_text);
        }
        }
    });
            // res.redirect("/campgrounds");
        });
    });
});

router.post('/verify', (req, res) => {
    let pin = req.body.pin;
    let requestId = req.body.requestId;
   
    nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
      if(err) {
        // handle the error
      } else {
        if(result && result.status == '0') { // Success!
          //res.status(200).send('Account verified!');
          res.redirect('/campgrounds');
          //res.render('status', {message: 'Account verified! ?'});
        } else {
          // handle the error - e.g. wrong PIN
        }
      }
    });
  });

// show login form
router.get("/login", function(req, res){
    res.render("login");
});

// login in
router.post("/login", passport.authenticate("local", 
    {
        successRedirect:"/campgrounds",
        failureRedirect:"/login"
    }), function(req, res){
        
});

// logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});

module.exports = router;