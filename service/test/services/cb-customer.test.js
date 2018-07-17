const assert = require('assert');
const app = require('../../src/app');

describe('\'customer\' service', () => {
  it('registered the service', () => {
    const service = app.service('customer');

    assert.ok(service, 'Registered the service');
  });
});
