const assert = require('assert');
const app = require('../../src/app');

describe('\'/register-permission-scope\' service', () => {
  it('registered the service', () => {
    const service = app.service('register-permission-scope');

    assert.ok(service, 'Registered the service');
  });
});
