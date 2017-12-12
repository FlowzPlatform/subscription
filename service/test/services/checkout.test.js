const assert = require('assert');
const app = require('../../src/app');

describe('\'checkout\' service', () => {
  it('registered the service', () => {
    const service = app.service('checkout');

    assert.ok(service, 'Registered the service');
  });
});
