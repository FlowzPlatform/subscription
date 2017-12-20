const assert = require('assert');
const app = require('../../src/app');

describe('\'register-roles\' service', () => {
  it('registered the service', () => {
    const service = app.service('register-roles');

    assert.ok(service, 'Registered the service');
  });
});
