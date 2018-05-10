const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const User = require('../models/user');

router.route('/create')
  .get((req, res, next) => {
      res.render('register.html.twig');
  })
  .post([
    check('username')
      .exists().withMessage('Имя пользователя не может быть пустым')
      .isAlphanumeric().withMessage('Имя пользователя может содержать только цифры и латинские буквы')
      .isLength({ min: 3 }).withMessage('Имя пользователя должно состоять минимум из трёх символов')
      .trim()
      .custom(value => {
        return User.findOne({ username: value })
          .then(user => {
            if(user) throw new Error('Пользователь с таким именем уже зарегестрирован');
          })
      }),
    check('email')
      .exists().withMessage('Забыли указать email')
      .isEmail().withMessage('Ошибка в указанном email')
      .custom(value => {
        return User.findOne({ email: value })
          .then(user => {
            if(user) throw new Error('Этот email уже используется');
          })
      }),
    check('password')
      .exists().withMessage('Забыли ввести пароль')
      .isLength({ min: 6 }).withMessage('Слишком короткий пароль. Минимум 6 символов'),
    check('passwordConf', 'Введённые пароли не совпадают')
      .exists()
      .custom((value, { req }) => value === req.body.password),
  ],(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.mapped();
      const errorsList = Object.keys(validationErrors).map((key) => {
        return {
          key: key,
          message: validationErrors[key].msg,
        };
      });

      const oldBody = req.body;
      return res.status(422).render('register.html.twig', {
        oldBody,
        validationErrors: errorsList,
      });
    }

    if (
      !req.body.email,
      !req.body.username,
      !req.body.password,
      !req.body.passwordConf
    ) {
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
