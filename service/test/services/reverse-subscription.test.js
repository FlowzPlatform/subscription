const assert = require('assert');
const app = require('../../src/app');

describe('\'reverse-subscription\' service', () => {
  it('registered the service', () => {
    const service = app.service('reverse-subscription');

    assert.ok(service, 'Registered the service');
  });
});
