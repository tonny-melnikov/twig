var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var moment = require('moment-timezone');
var config = require('./config');

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
	User.findOne({ email: email }, function(err, user) {
		if (!user) {
      const msg = config.env === 'development' ? `No user with shuch email found ${email}` : 'Не верно указан email или пароль'
			return done(null, false, { msg });
		}

		if (!user.isVerified) {
			return done(null, false, { msg: `Нужно подтвердить электронную почту. Подождите 5 минут, проверьте вашу почту повторно. Если письмо не пришло - нажмите сюда: <p><a href="/user/verify-resend/${email}" class="btn waves-effect white black-text"><i class="material-icons left">email</i>Re-send verification email</a></p>` });
		}

		if (user.isLocked) {
			return user.incrementLoginAttempts(function(err) {
				if (err) {
					return done(err);
				}
        return done(null, false, { msg: `Число попыток входа в вашу учётную запись исчерпано. Чтобы избежать взлом и защитить вас, мы заморозили вход в вашу учётную запись до ${moment(user.lockUntil).tz(config.server.timezone).format('LT z')}. Мы заботимся о вашей безопасности. Спасибо за понимание!`});
			});
		}

		user.comparePassword(password, function(err, isMatch) {
			if (isMatch) {
				return done(null, user);
			}
			else {
				user.incrementLoginAttempts(function(err) {
					if (err) {
						return done(err);
					}

					return done(null, false, { msg: 'Invalid password.  Please try again.' });
				});
			}
		});
	});
}));

exports.isAuthenticated = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	req.flash('info', { msg: "You must be logged in to visit that page." });
	res.redirect('/user/login');
};
