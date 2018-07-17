const assert = require('assert');
const app = require('../../src/app');

describe('\'cb-plan\' service', () => {
  it('registered the service', () => {
    const service = app.service('cb-plan');

    assert.ok(service, 'Registered the service');
  });
});
