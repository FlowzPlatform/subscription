const assert = require('assert');
const app = require('../../src/app');

describe('\'user-subscription\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-subscription');

    assert.ok(service, 'Registered the service');
  });
});
