const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { twig }  = require( 'twig' ); 

const config = require('./config');

// routes
const main = require('./routes/index');
const users = require('./routes/users');

const app = express();
const PORT = 3000;

app.set( 'view engine', 'twig' );

app.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 86400 },
//    store: new MongoStore({ mongooseConnection: mongoose.connection }),
//    cookie: {
//        maxAge: 60000,
//        secure: true,
//        }
  }));
app.use(flash());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('*', (req, res, next) => {
//    if (req.session && req.session.userId) res.locals.user = req.session.userId;
    if (req.flash) res.locals.messages = req.flash('info');
    next();
});

app.get('/flash', (req, res) => {
   req.flash('info', 'Hello from flash middleware!');
   res.redirect('/');
});

app.use('/', main);
app.use('/users', users);

app.use((req, res, next) => {
  const e404 = {};
  e404.message = 'Not Found';
  e404.status = 404;
  next(e404);
});

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(`ERROR: ${JSON.stringify(err)}`);
});

mongoose.connect('mongodb://localhost/auth2')
  .catch((err) => {
    console.log(err);
    console.log('===============');
    console.log('Не стартануло mongodb!');
    console.log('sudo service mongod start (sudo systemctl start mongodb)');
    process.exit(0);
  });

mongoose.connection.once('open', () => {
  console.log('DB connected...')
  app.listen(PORT, (err) => {
    if(err) console.log(err);
    console.log(`Server listening on port ${PORT}...`);
  });
}).on('error', err => console.log(err));
