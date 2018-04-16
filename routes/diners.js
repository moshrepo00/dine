var express = require("express");
var router  = express.Router();
var Diner = require("../models/diner");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');
var { isLoggedIn, checkUserDiner, checkUserComment, isAdmin, isSafe } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all diners
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all diners from DB
      Diner.find({name: regex}, function(err, allDiners){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allDiners);
         }
      });
  } else {
      // Get all diners from DB
      Diner.find({}, function(err, allDiners){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allDiners);
            } else {
              res.render("diners/index",{diners: allDiners, page: 'diners'});
            }
         }
      });
  }
});

//CREATE - add new diner to DB
// router.post("/", isLoggedIn, isSafe, function(req, res){ unsplash middleware
router.post("/", isLoggedIn, function(req, res){
  // get data from form and add to diners array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || data.status === 'ZERO_RESULTS') {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    console.log(data.results);
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newDiner = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // Create a new diner and save to DB
    Diner.create(newDiner, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to diners page
            console.log(newlyCreated);
            res.redirect("/diners");
        }
    });
  });
});

//NEW - show form to create new diner
router.get("/new", isLoggedIn, function(req, res){
   res.render("diners/new"); 
});

// SHOW - shows more info about one diner
router.get("/:id", function(req, res){
    //find the diner with provided ID
    Diner.findById(req.params.id).populate("comments").exec(function(err, foundDiner){
        if(err || !foundDiner){
            console.log(err);
            req.flash('error', 'Sorry, that diner does not exist!');
            return res.redirect('/diners');
        }
        console.log(foundDiner)
        //render show template with that diner
        res.render("diners/show", {diner: foundDiner});
    });
});

// EDIT - shows edit form for a diner
router.get("/:id/edit", isLoggedIn, checkUserDiner, function(req, res){
  //render edit template with that diner
  res.render("diners/edit", {diner: req.diner});
});

// PUT - updates diner in the database
router.put("/:id", isSafe, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
    Diner.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, diner){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/diners/" + diner._id);
        }
    });
  });
});

// DELETE - removes diner and its comments from the database
router.delete("/:id", isLoggedIn, checkUserDiner, function(req, res) {
    Comment.remove({
      _id: {
        $in: req.diner.comments
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.diner.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Diner deleted!');
            res.redirect('/diners');
          });
      }
    })
});

module.exports = router;

