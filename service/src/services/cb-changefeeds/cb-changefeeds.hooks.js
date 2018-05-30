const config = require('../config.js');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const moment = require('moment');

moment().format();

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => getChangeFeeds(hook)
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

async function getChangeFeeds(hook) {
  console.log('CHANGEFEEDS-HOOK:: ', hook.data);
  if (hook.data.event_type == 'invoice_generated' ) {
    let cb_subscription_id = hook.data.content.invoice.subscription_id;
    let customer_id = hook.data.content.invoice.customer_id;
    let user_sub_id = null;
    let subscriptionDetails = null;
    let patchData = {};
    console.log('User-Agent ::', hook.params.headers['user-agent']);

    user_sub_id = await(getUserSubscription(cb_subscription_id, hook));

    console.log('subscriptionId ::', user_sub_id);
    subscriptionDetails = await(getSubscription(cb_subscription_id));

    patchData.expiredOn =  moment.unix(subscriptionDetails.subscription.current_term_end).format();
    console.log('subscriptionDetails :: ',  patchData.expiredOn);

    hook.app.service('user-subscription').patch(user_sub_id, patchData).then(res => {
      console.log('Updated user-subscription ::', res);
    }).catch(err => {
      console.log('Error while updating user-subscription ::', err);
    });
  }
  hook.result = hook.data;
  return hook;
}

function getUserSubscription(cb_subscription_id, hook) {
  return new Promise((resolve, reject) => {
    hook.app.service('user-subscription').find({query: {sub_id: cb_subscription_id, paginate: 'false'}, headers: {'User-Agent': hook.params.headers['user-agent']}}).then(res => {
      console.log('getUserSubscription Res :: ', res);
      resolve(res[0].id);
    }).catch(err => {
      console.log('getUserSubscription Error :: ', err);
      reject({ api_error_code: err.name, error_msg: 'Internal server error.' });
    });
  });
}

function getSubscription(cb_subscription_id) {
  return new Promise((resolve, reject) => {
    config.chargebee.subscription.retrieve(cb_subscription_id).request((error, result) => {
      if (error) {
        console.log('Getting Sub Error :: ', error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}