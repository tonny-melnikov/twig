const User = require('../models/user');

exports.list = {
	get: (req, res, next) => {
    User.find({}, (err, users) => {
      if (err) {
        console.log(err);
        req.flash('info', config.messages.retry);
        return res.redirect('/admin/users');
      }
      res.render('admin-users.html.twig', { users });
    })
	}
};

exports.upgrade = {
  get: (req, res, next) => {
    const acl = require('../authorization').getAcl();

    User.update({ _id: req.query.id }, {
      $set: { role: req.query.to },
    }, (err, result) => {
      if (err) {
        console.log(err);
        req.flash('info', config.messages.retry);
        return res.redirect('/admin/users');
      }
      if (parseInt(req.query.to, 10) === 777) {
        // https://github.com/OptimalBits/node_acl#removeUserRoles
        acl.removeUserRoles(req.query.id, '777', function(err) {
          if (err) {
            console.log(err);
            req.flash('info', config.messages.crit);
            return res.redirect('/');
          }

          req.flash('info', 'Привилегии пользователя были успешно изменены');
          return res.redirect('/admin/users');
        });
      } else {
        acl.addUserRoles(req.query.id, '777', function(err) {
          if (err) {
            console.log(err);
            req.flash('info', config.messages.crit);
            return res.redirect('/');
          }

          req.flash('info', 'Привилегии пользователя были успешно изменены');
          return res.redirect('/admin/users');
        });
      }

    });
  }
};
