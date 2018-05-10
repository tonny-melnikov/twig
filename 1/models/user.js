const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserScheema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: true,
  }
});

UserScheema.pre('save', function(next) {
  const user = this;
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    console.log(user);
    next();
  });
});

UserScheema.statics.authenticate = (email, password, callback) => {
  User.findOne({ email })
    .then((user) => {
      if (!user) callback('Wrong user or password!', null);
      else {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) callback('Wrong user or password!', null);
          else  callback(null, user);
        });
      }
    })
    .catch(err => callback(err, null))
};

const User = mongoose.model('user', UserScheema);

module.exports = User;
