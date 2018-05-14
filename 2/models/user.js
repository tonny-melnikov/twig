const mongoose = require('mongoose');
// const async = require('async');
const bcrypt = require('bcrypt');
const config = require('../config');

const userSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true, trim: true },
  username: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  // verificationToken: {type: String, unique: true, required: true },
  // isVerified: { type: Boolean, required: true, default: false },
  // passwordResetToken: { type: String, unique: true },
  // passwordResetExpires: Date,
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: Date,
  role: String
});

userSchema.pre('save', function(next) {
  const user = this;

  if (!user.isModified('password')) {
		return next();
	}

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    console.log(user);
    next();
  });
});

userSchema.virtual('isLocked').get(function() {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});



userSchema.statics.authenticate = (email, password, callback) => {
  User.findOne({ email })
    .then((user) => {
      if (!user) callback('Wrong user or password!', null);
      else {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) callback('Wrong user or password!', null);
          else callback(null, user);
        });
      }
    })
    .catch(err => callback(err, null))
};

userSchema.statics.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, callback);
}


// userSchema.methods.comparePassword = function(passwordToCompare, callback) {
// 	var user = this;
//
// 	async.waterfall([
// 		function(waterfallCb) {
// 			bcrypt.compare(passwordToCompare, user.password, function(err, isMatch) {
// 				if (err) {
// 					return waterfallCb(err);
// 				}
//
// 				waterfallCb(null, isMatch);
// 			});
// 		},
// 		function(isMatch, waterfallCb) {
// 			if (bcrypt.getRounds(user.password) !== config.login.passwordHashRounds) {
// 				user.password = passwordToCompare;
//
// 				user.save(function(err, user) {
// 					if (err) {
// 						return waterfallCb(err, isMatch);
// 					}
//
// 					waterfallCb(null, isMatch);
// 				});
// 			}
// 			else {
// 				waterfallCb(null, isMatch);
// 			}
// 		}
// 	], function(err, isMatch) {
// 		if (err) {
// 			return callback(err);
// 		}
//
// 		callback(null, isMatch);
// 	});
// };

userSchema.methods.incrementLoginAttempts = function(callback) {
	var lockExpired = !!(this.lockUntil && this.lockUntil < Date.now());

	if (lockExpired) {
		return this.update({
			$set: { loginAttempts: 1 },
			$unset: { lockUntil: 1 }
		}, callback);
	}

	var updates = { $inc: { loginAttempts: 1 } };
	var needToLock = !!(this.loginAttempts + 1 >= config.login.maxAttempts && !this.isLocked);

	if (needToLock) {
		updates.$set = { lockUntil: Date.now() + config.login.lockoutHours };
	}

	return this.update(updates, callback);
};

const User = mongoose.model('user', userSchema);

module.exports = User;
