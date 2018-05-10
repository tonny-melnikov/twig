const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.get('/', (req, res) => {
  User.find({}, (err, users) => {
      if(err) return next(err);
      res.render('main.html.twig', {users: JSON.stringify(users).replace(/,/g,',\n')});
  });
});

router.get('/dashboard', requiresLogin, (req, res, next) => {
    res.render('dashboard.html.twig');
});


function requiresLogin(req, res, next) {
    console.log(req.session);
    if (req.session && req.session.userId) {
        return next();
    } else {
        const err = {};
        err.message = 'You must log in to watch this page';
        err.status = 401;
        next(err);
    }
}

module.exports = router;
