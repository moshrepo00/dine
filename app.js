var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    Diner  = require("./models/diner"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session = require("express-session"),
    seedDB      = require("./seeds"),
    methodOverride = require("method-override");
// configure dotenv
require('dotenv').load();

//requiring routes
var commentRoutes    = require("./routes/comments"),
    dinerRoutes = require("./routes/diners"),
    indexRoutes      = require("./routes/index")
    
// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

const databaseUri = process.env.MONGODB_URI || 'mongodb://localhost/dinerhk';

mongoose.connect(databaseUri, { useMongoClient: true })
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "msrepo",
    resave: false,
    saveUninitialized: false
}));



app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use("/", indexRoutes);
app.use("/diners", dinerRoutes);
app.use("/diners/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The DinerHK Server Has Started!");
});