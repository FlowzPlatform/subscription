const assert = require('assert');
const app = require('../../src/app');

describe('\'cb-addon\' service', () => {
  it('registered the service', () => {
    const service = app.service('cb-addon');

    assert.ok(service, 'Registered the service');
  });
});
