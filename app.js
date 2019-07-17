require('dotenv').config()

var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    flash           = require("connect-flash"),
    Campground      = require("./models/campground"),
    methodOverride  = require("method-override"),
    Comment         = require("./models/comment"),
    User            = require("./models/user");
    //seedDB          = require("./seeds");

var commentRoute    = require("./routes/comments"),
    campgroundRoute = require("./routes/campgrounds"),
    authRoute       = require("./routes/index");
var Db = require('mongodb').Db,
MongoClient = require('mongodb').MongoClient;
// redisDemo.js 
var redis = require('redis'); 
var client = redis.createClient(); // this creates a new client
//seedDB();
MongoClient.connect('mongodb://dbuser:qwerty123@ds251877.mlab.com:51877/yelpcamp');
//mongoose.connect('mongodb://dbuser:qwerty123@ds251877.mlab.com:51877/yelpcamp');//mongodb://localhost:27017/ypcamp   
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use(authRoute);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/comments", commentRoute);

client.on('connect', function() {
   console.log('Redis client connected');
 });

app.listen(process.env.PORT || 8081, function(){
   console.log("YelpCamp application started!!!"); 
});