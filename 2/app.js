const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const helmet = require('helmet');
const csrf = require('csurf');
const cookieParser = require('cookie-parser'); // required for csrf
const passport = require('passport');

const bodyParser = require('body-parser');
const flash = require('connect-flash');
const { twig }  = require( 'twig' );
const config = require('./config');

// init app
const app = express();
const PORT = 3000;
const authentication = require('./authentication');

// secure
// app.use(sslRedirect()); // ???
app.use(helmet());

// mongodb connection
// sudo service mongod start (sudo systemctl start mongodb)
mongoose.connect(config.db.uri)
  .catch((err) => {
    console.log(err);
    process.exit(0);
  });
mongoose.connection.once('open', () => {
  console.log('DB connected...')
  require('./authorization').init();
  set_routes();
}).on('error', err => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig' );

// body parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//app.use( express.methodOverride() );
app.use(session({
	name: config.session.name,
	resave: true,
	saveUninitialized: false,
	secret: config.session.secret,
	store: new MongoStore({ url: config.db.uri, autoReconnect: true }),
	cookie: {
		httpOnly: true,
		maxAge: 1000 * 60 * 60,
		secure: 'auto'
	}
}));
app.use(cookieParser());
// csrf protection MUST be defined after session middleware
app.use(csrf({ cookie: true }));
// const csrfProtection = csrf({ cookie: true }); // usage as middleware COMMENTED!

// passport needs to come after session initialization
app.use(passport.initialize());
app.use(passport.session());

// others
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// pass properties to routes
app.get('*', (req, res, next) => {
  // console.log(req.session);
    if (req.session && req.session.passport.user) res.locals.user = req.session.passport.user;
    if (req.flash) res.locals.messages = req.flash('info');
    next();
});

// --- ROUTES:
app.get('/flash', (req, res) => {
   req.flash('info', 'Hello from flash middleware!');
   res.redirect('/');
});

// the reason to put routes in separate function was the MongoStore initialization error
function set_routes() {
  const main = require('./routes/index');
  const users = require('./routes/user');
  const admin = require('./routes/admin');

  app.use('/', main);
  app.use('/user', users);
  app.use('/admin', admin);

  // catch 404
  app.use(function(req, res, next) {
  	var err = new Error('Not Found');
  	err.status = 404;
  	next(err);
  });

  /*
  By enabling the "trust proxy" setting via app.enable('trust proxy'), Express will have knowledge that it's sitting behind a proxy and that the X-Forwarded-* header fields may be trusted, which otherwise may be easily spoofed.

  Enabling this setting has several subtle effects. The first of which is that X-Forwarded-Proto may be set by the reverse proxy to tell the app that it is https or simply http. This value is reflected by req.protocol.

  The second change this makes is the req.ip and req.ips values will be populated with X-Forwarded-For's list of addresses.
  */
  if (config.env === 'production') {
  	app.set('trust proxy', 1);
  }

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
  	app.use(function(err, req, res, next) {
  		res.status(err.status || 500);
  		res.render('error.html.twig', {
  			message: err.message,
  			error: err
  		});
  	});
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
  	res.status(err.status || 500);
  	res.render('error.html.twig', {
  		message: err.message,
  		error: {}
  	});
  });
}// < end of routes

module.exports = app;
