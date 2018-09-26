const assert = require('assert');
const app = require('../../src/app');

describe('\'cb-addons-user\' service', () => {
  it('registered the service', () => {
    const service = app.service('cb-addons-user');

    assert.ok(service, 'Registered the service');
  });
});
