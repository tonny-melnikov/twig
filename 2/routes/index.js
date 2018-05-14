const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.get('/', (req, res) => {
  console.log('index');
  User.find({}, (err, users) => {
      if(err) return next(err);
      console.log('inside');
      res.render('main.html.twig', {users: JSON.stringify(users).replace(/,/g,',\n')});
  });
});

module.exports = router;
