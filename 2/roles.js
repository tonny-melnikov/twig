const node_acl = require('acl');

let instance = null;

module.exports = class roles {
  constructor(connection) {
    if (!instance) {
      instance = this;
    }

    this._type = 'roles';
    this.acl = new acl(new node_acl.mongodbBackend(connection, 'acl_'));;
    this.setupPrivileges();

    return instance;
  }

  static setupPrivileges() {
    this.acl.allow([
      {
        roles: 'admin',
        allows: [
          { resources: '/secret', permissions: '*' }
        ]
      }, {
        roles: 'user',
        allows: [
          { resources: '/secret', permissions: 'get' }
        ]
      }, {
        roles: 'guest',
        allows: []
      }
    ]);
    // Inherit roles
    //  Every user is allowed to do what guests do
    //  Every admin is allowed to do what users do
    this.acl.addRoleParents( 'user', 'guest' );
    this.acl.addRoleParents( 'admin', 'user' );
    return;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }
}
