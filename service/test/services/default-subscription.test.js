const assert = require('assert');
const app = require('../../src/app');

describe('\'default_subscription\' service', () => {
  it('registered the service', () => {
    const service = app.service('default-subscription');

    assert.ok(service, 'Registered the service');
  });
});
