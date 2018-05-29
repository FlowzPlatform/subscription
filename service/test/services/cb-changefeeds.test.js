const assert = require('assert');
const app = require('../../src/app');

describe('\'cb-changefeeds\' service', () => {
  it('registered the service', () => {
    const service = app.service('cb-changefeeds');

    assert.ok(service, 'Registered the service');
  });
});
