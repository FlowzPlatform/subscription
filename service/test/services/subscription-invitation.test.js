const assert = require('assert');
const app = require('../../src/app');

describe('\'subscriptionInvitation\' service', () => {
  it('registered the service', () => {
    const service = app.service('subscription-invitation');

    assert.ok(service, 'Registered the service');
  });
});
