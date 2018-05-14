const node_acl = require('acl');
const mongoose = require('mongoose');
const config = require('./config');

const mongoBackend = new node_acl.mongodbBackend(mongoose.connection.db, config.db.aclCollectionPrefix);
const acl = new node_acl(mongoBackend, { debug: function(string) { console.log(string); } });

module.exports = {
	init: function() {

    // Inherit roles
    //  Every user is allowed to do what guests do
    //  Every admin is allowed to do what users do
    acl.addRoleParents( '1', '0' );
    acl.addRoleParents( '777', '1' );

    acl.allow([
      {
        roles: ['777'],
        allows: [
          { resources: '/admin/users', permissions: '*' }
        ]
      }, {
        roles: ['1'],
        allows: [
          { resources: '/user/dashboard', permissions: 'get' }
        ]
      }, {
        roles: ['0'],
        allows: []
      }
    ]);
/* advanced usage example :

    acl.addRoleParents('superAdmin', 'admin');
    acl.addRoleParents('admin', 'user');

    acl.allow([
			{
				roles: ['admin'],
				allows: [
					{
						resources: '/user/list',
						permissions: 'get'
					}
				]
			},
			{
				roles: ['superAdmin'],
				allows: [
					{
						resources: '/admin/list',
						permissions: 'get'
					}
				]
			}
		]);
*/
	},

	getAcl: function() {
		return acl;
	}
};
