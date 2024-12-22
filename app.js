require('dotenv').config();

const express = require('express');
const exphbs = require("express-handlebars");
const cookieParser = require('cookie-parser');
const session = require('express-session')
const bodyParser = require("body-parser");
var { v4: uuidv4 } = require("uuid");
var moment = require("moment");

var path = require("path");

const app = express();
const PORT = 1991 || process.env.PORT;

///allow data to be sent by submit form
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

//parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));

//parse application.json
app.use(bodyParser.json());

var sec = uuidv4();
app.use(
  session({
    secret: sec,
    resave: true,
    saveUninitialized: true,
  })
);

//add public media and resourse file
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "/uploads")));
app.use(express.static(path.join(__dirname, "/node_modules")));

//template Engine
const handlebars = exphbs.create({
  extname: ".hbs",
  helpers: {
    substr: function (len, context) {
      if (context.length > len) {
        return context.substring(0, len) + "...";
      } else {
        return context;
      }
    },
    subdate: function (context) {
      //var context = context.toString()
      return moment(context).format("DD - MMMM - YYYY");
    },
    if_function: function (v1, v2) {
      if (v1 == v2) {
        return true;
      } else {
        return false;
      }
    },
    if_student_has_data: function (sl, re) {
      if (sl > 0 && re <= 2) {
        return true;
      } else {
        return false;
      }
    },
    index_of: function (arr, ind) {
      return arr[ind]
    },
    if_student_has_not_data: function (sl, re) {
      if (sl == 0 && re < 3) {
        return true;
      } else {
        return false;
      }
    },
    minus: function (v1, v2) {
        return (v1 - v2)
    },
    price: function (price) {
      return price.toLocaleString();
    },
  },
});
app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");
////set cookies
app.use((req, res, next) => {
    var cookie_data = req.cookies.new_forum_user;
  
    if (!req.session.user && cookie_data === undefined) {
      req.session.user = { isLoged: false, user: {} };
    }
  
    //console.log("defore cokies");
    //console.log(req.session.user);
  
    if (cookie_data) {
      req.session.user = cookie_data;
    }
  
    console.log("after cookies data set");
    console.log(req.session.user);
  
    next();
  });
  
//routs issues
//routs issues
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/en'));
app.use('/sp', require('./server/routes/sp'));
app.use('/fr', require('./server/routes/fr'));

///check if page not exist
app.use(function (req, res, next) {
    res.status(404);
    // respond with html page
    if (req.accepts("html")) {
      //res.render("404", { url: req.url });
       res.redirect('/404');
      return;
    }
  });

  
  app.listen(PORT, ()=>{
    console.log(`NearLord is now Running on Port ${PORT}`);
});
//app.listen();