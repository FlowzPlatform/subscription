const assert = require('assert');
const app = require('../../src/app');

describe('\'secure-routes\' service', () => {
  it('registered the service', () => {
    const service = app.service('secure-routes');

    assert.ok(service, 'Registered the service');
  });
});
