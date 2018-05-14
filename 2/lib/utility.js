const { check } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const config = require('../config');
const nodemailer = require('nodemailer');
const CryptoJS = require("crypto-js");
const User = require('../models/user');

exports.getUserId = function(req, res) {
	console.log(`req.user: ${req.user}`);
	if (typeof req.user !== 'undefined') {
		console.log(`req.user.id: ${req.user.id}`);
		return req.user.id;
	}

	return false;
};

exports.constructUrl = (req, path) => {
	return req.protocol + '://' + req.get('host') + path;
};

exports.createRandomToken = function() {
	return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.sha256);
};

exports.regValidation = [
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
		.isLength({ min: config.login.minimumPasswordLength }).withMessage(`Слишком короткий пароль. Минимум ${config.login.minimumPasswordLength} символов`),
	check('passwordConf', 'Введённые пароли не совпадают')
		.exists()
		.custom((value, { req }) => value === req.body.password),
];

exports.loginValidation = [
	// check('username')
	// 	.exists().withMessage('Имя пользователя не может быть пустым')
	// 	.isAlphanumeric().withMessage('Имя пользователя может содержать только цифры и латинские буквы'),
	check('email')
		.exists().withMessage('Забыли указать email')
		.isEmail().withMessage('Ошибка в указанном email'),
	check('password')
		.isLength({ min: config.login.minimumPasswordLength }).withMessage('Забыли ввести пароль'),
];

exports.changePasswordValidation = [
	check('password')
		.isLength({ min: config.login.minimumPasswordLength }).withMessage('Забыли ввести пароль'),
	check('passwordConf', 'Введённые пароли не совпадают')
		.exists()
		.custom((value, { req }) => value === req.body.password),
]

/*
exports.sendEmail = function(to, from, subject, contents, callback) {
	let transporter = nodemailer.createTransport({
			host: 'smtp.email.ua',
			port: 465,
			secure: true, // true for 465, false for other ports
			auth: {
					user: config.email.login,
					pass: config.email.password
			},
			// tls: {
			// 	rejectUnauthorized: false
			// }
	});

	// setup email data with unicode symbols
	let mailOptions = {
			from, // sender address
			to, // list of receivers
			subject, // Subject line
			text: contents, // plain text body
			html: contents // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, callback);
};
*/
