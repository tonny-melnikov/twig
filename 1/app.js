const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { twig }  = require( 'twig' ); 

// routes
const users = require('./routes/users');

const app = express();
const PORT = 3000;

app.set( 'view engine', 'twig' );

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());



app.get('/', (req, res) => {
  res.render('main.html.twig');
});

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
  res.send(`ERROR: ${err}`);
});

mongoose.connect('mongodb://localhost/auth1')
  .catch((err) => {
    console.log(err);
    console.log('===============');
    console.log('Не стартануло mongodb!');
    console.log('sudo service mongod start');
    process.exit(0);
  });

mongoose.connection.once('open', () => {
  console.log('DB connected...')
  app.listen(PORT, (err) => {
    if(err) console.log(err);
    console.log(`Server listening on port ${PORT}...`);
  });
}).on('error', err => console.log(err));
