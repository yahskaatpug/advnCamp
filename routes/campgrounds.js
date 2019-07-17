var express     = require("express"),
    router      = express.Router(),
    Campground  = require("../models/campground"),
    middleware  = require("../middleware");
    var redis = require('redis');
    var client = redis.createClient();
    // INDEX ROUTE
router.get("/", function(req, res){
    //get all campground from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err) {
            console.log(err);
        } else {
            
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
    // var cname = req.body.name;
    // client.hgetall(cname,function(err, data){
    //     if(!data){
    //         res.render("campgrounds/index", {campgrounds:data});
    //     }else{
    //         // data.name = name;
    //         // res.render('users',{users: data});
    //         Campground.find({}, function(err, allCampgrounds){
    //         if(err) {
    //         console.log(err);
    //         } else {
            
    //         res.render("campgrounds/index", {campgrounds: allCampgrounds});
    //         }
    //     });
    //     }
        
    // })
});

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
    var name  = req.body.name,
        price = req.body.price,
        image = req.body.image,
        desc  = req.body.description,
        author = {
           id: req.user._id,
           username: req.user.username
        };
    var newCampground = {name: name, price:price, image: image, description: desc, author: author};
// create a new campground and save it to DB
   Campground.create(newCampground, function(err, newlyCreated){
       if(err){
           console.log(err);
       } else{
           res.redirect("/campgrounds");
       }
   });
});

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// SHOW ROUTE
router.get("/:id", function(req, res){
    //find the campground with provided ID
    //render show template with that campground
    var terms = req.params.id;
    client.get(terms, (err, result) => {
      if (result != null) {
        console.log("Cache hit for " + terms);
        //console.log(result);
        //res.render("campgrounds/index", {campgrounds: result});
        //var x=JSON.stringify(result)
        console.log(JSON.parse(result));
        //var x=result.author.id;
        res.render("campgrounds/show", {campground:JSON.parse(result)});
        //var x=JSON.parse(result);
        //console.log(x);
        //res.json(JSON.parse(result));
      } 
      else{
        Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
            if(err){
                console.log(err);
            } else {
               // var x=JSON.parse(foundCampground);
                client.setex(terms,120 ,JSON.stringify(foundCampground));
                console.log("wowowowowo");
                console.log(foundCampground);
                res.render("campgrounds/show", {campground: foundCampground});
            }
        });

      }
    });
    // Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
    //     if(err){
    //         console.log(err);
    //     } else {
    //         //client.setex(terms, 300,foundCampground);
    //         res.render("campgrounds/show", {campground: foundCampground});
    //     }
    // });
   
});

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        client.flushdb( function (err, succeeded) {
            console.log(succeeded); // will be true if successfull
        });
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

router.put("/:id", function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else{
            req.flash("success", "Campground updated")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else{
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;