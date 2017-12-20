const assert = require('assert');
const app = require('../../src/app');

describe('\'subscription-plans\' service', () => {
  it('registered the service', () => {
    const service = app.service('subscription-plans');

    assert.ok(service, 'Registered the service');
  });
});
