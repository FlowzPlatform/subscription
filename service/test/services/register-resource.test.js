const assert = require('assert');
const app = require('../../src/app');

describe('\'/register-resource\' service', () => {
  it('registered the service', () => {
    const service = app.service('register-resource');

    assert.ok(service, 'Registered the service');
  });
});
