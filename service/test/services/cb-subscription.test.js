const assert = require('assert');
const app = require('../../src/app');

describe('\'cb-subscription\' service', () => {
  it('registered the service', () => {
    const service = app.service('cb-subscription');

    assert.ok(service, 'Registered the service');
  });
});
