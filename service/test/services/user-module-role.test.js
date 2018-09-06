const assert = require('assert');
const app = require('../../src/app');

describe('\'user-module-role\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-module-role');

    assert.ok(service, 'Registered the service');
  });
});
