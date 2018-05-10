const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.route('/')
  .get((req, res, next) => {
    res.send('<h1 style="text-align: center">Hello from routes/users.js</h1>');
  })
  .post((req, res, next) => {
    console.log(req.body);
    if (
      !req.body.email,
      !req.body.username,
      !req.body.password,
      !req.body.passwordConf
    ) {
      res.json({ success: false, message: 'All fields required!'});
    } else {
      const newUser = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        passwordConf: req.body.passwordConf,
      };

      User.create(newUser, (err, user) => {
        if (err) res.json({ success: false, message: `Error on create: ${JSON.stringify(err)}` });
        else res.json({ success: true, message: `User ${newUser.username} was registered and can login` });
      });
    }
  });

router.route('/login')
  .get((req, res, next) => {
    res.send('<h1 style="text-align: center">Hello from routes/users.js</h1>');
  })
  .post((req, res, next) => {
    if (
      !req.body.email,
      !req.body.password
    ) {
      res.json({ success: false, message: 'All fields required!'});
    } else {
      User.authenticate(req.body.email, req.body.password, (err, user) => {
        if (err) res.json({ success: false, message: 'Wrong email or password!' });
        else res.json({ success: true, message: `Now you are logged in!` });
      });
    }
  });


module.exports = router;
