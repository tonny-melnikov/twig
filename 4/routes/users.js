const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.route('/create')
  .get((req, res, next) => {
      res.render('register.html.twig');
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
        else {
            req.flash('info', 'You can Log in now');
            res.redirect('/users/login')
        }
//        else res.json({ success: true, message: `User ${newUser.username} was registered and can login` });
      });
    }
  });

router.route('/login')
  .get((req, res, next) => {
      res.render('login.html.twig');
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
        else {
            req.session.userId = user._id;
            req.flash('info', 'Now you are logged in. Welcome!');
            res.redirect('/dashboard')
        }
//        else res.json({ success: true, message: `Now you are logged in!` });
      });
    }
  });

router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if(err) return next(err);
            res.redirect('/');
        });
    }
});


module.exports = router;
