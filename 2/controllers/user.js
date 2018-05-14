const User = require('../models/user');
const { validationResult } = require('express-validator/check');
const config = require('../config');
const utility = require('../lib/utility');
const passport = require('passport');

exports.register = {
  get: (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash('info', config.messages.loginWaste);
      return res.redirect('/');
    }
    res.render('register.html.twig', {
      minimumPasswordLength: config.login.minimumPasswordLength,
      csrf: req.csrfToken()
    });
  },
  post: (req, res, next) => {
    const errors = validationResult(req);
    const oldBody = req.body;

    if (!errors.isEmpty()) {
      const validationErrors = errors.mapped();
      const errorsList = Object.keys(validationErrors).map((key) => {
        return {
          key: key,
          message: validationErrors[key].msg,
        };
      });

      // res.locals.oldBody = oldBody;
      // res.locals.validationErrors = errorsList;
      // return res.redirect('/user/register');
      return res.status(422).render('register.html.twig', {
        oldBody,
        validationErrors: errorsList,
        csrf: req.csrfToken()
      });
    }

    const verificationToken = utility.createRandomToken();

		const user = new User({
      username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			verificationToken: verificationToken,
      passwordResetToken: verificationToken,
			isVerified: false,
		});

		const acl = require('../authorization').getAcl();

    User.findOne({ username: req.body.username }, (err, existingUser) => {
      if (existingUser) {
        return res.status(422).render('register.html.twig', {
          oldBody,
          validationErrors: [{ key: null, message: config.messages.signNameBisy}],
          csrf: req.csrfToken()
        });
      }

      User.findOne({ email: req.body.email }, (err, existingUser2) => {
        if (existingUser2) {
          req.flash('info', config.messages.signAlreadyDone);
          res.redirect('/user/login');
        }

        user.save(function(err, newUser) {
  				if (err) {
  					console.log(err);
  					req.flash('info', config.messages.retry);
  					return res.redirect('/user/register');
  				}

          acl.addUserRoles(newUser._id.toString(), '1', function(err) { // set role to 1
  					if (err) {
  						console.log(err);
  						req.flash('info', config.messages.crit);
  						return res.redirect('/');
  					}

            req.flash('info', config.messages.signSuccess);
            res.redirect('/');

            //----------- email confirmation
  					// utility.sendEmail(req.body.email, config.email.sendFrom, 'Подтверждение регистрации',
            // `<p>Прежде чем вы сможете войти на сайт, вы должны подтвердить ваш электронный адрес перейдя по ссылке:</p><a href="${utility.constructUrl(req, '/user/verify/' + verificationToken)}">Нажать для подтверждения почты</a>`,
            // (err, json) => {
  					// 	if (err) {
  					// 		console.log(err);
  					// 		req.flash('info', 'Письмо не отправлено. Обязательно свяжитесь с администратором сайта!');
  					// 		return res.redirect('/');
  					// 	}

  					// 	req.flash('info', 'Ваш аккаунт успешно создан. Подтвердите ваш email, чтобы продолжить пользоваться сайтом.');
  					// 	res.redirect('/');
  					// });
  				});
				});
      });
    })
  }
};

exports.login = {
  get: (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    res.render('login.html.twig', { csrf: req.csrfToken() });
  },
  post: (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors = errors.mapped();
      const errorsList = Object.keys(validationErrors).map((key) => {
        return {
          key: key,
          message: validationErrors[key].msg,
        };
      });

      return res.status(422).render('login.html.twig', {
        validationErrors: errorsList,
        csrf: req.csrfToken()
      });
    }

    passport.authenticate('local', (err, user, info) => {
			if (err) {
				return next(err);
			}

			if (!user) {
				req.flash('info', info);
				return res.redirect('/user/login');
			}

			req.logIn(user, function(err) {
				if (err) {
					return next(err);
				}

				res.redirect('/');
			});
		})(req, res, next);
  }
};

exports.logout = {
  get: (req, res) => {
    req.logout();
    req.flash('info', config.messages.logout );
    res.redirect('/');
  }
}

exports.dashboard = {
  get: (req, res) => {
    res.render('dashboard.html.twig');
  }
}

exports.changePassword = {
  get: (req, res) => {
    res.render('change-password.html.twig', {
      csrf: req.csrfToken(),
    });
  },
  post: (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors = errors.mapped();
      const errorsList = Object.keys(validationErrors).map((key) => {
        return {
          key: key,
          message: validationErrors[key].msg,
        };
      });

      return res.status(422).render('change-password.html.twig', {
        validationErrors: errorsList,
        csrf: req.csrfToken()
      });
    }

    User.findOne({ email: req.user.email }, function(err, user) {
      if (err) {
        console.log(err);
        req.flash('info', config.messages.crit );
        return res.redirect('back');
      }

      user.password = req.body.password;

      user.save(function(err) {
        if (err) {
          console.log(err);
          req.flash('info', config.messages.retry);
          return res.redirect('back');
        }

        req.flash('info', config.messages.passwordChange);
        res.redirect('/');
      });
    });
  }
}
