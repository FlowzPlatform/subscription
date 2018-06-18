let async = require('asyncawait/async');
let await = require('asyncawait/await');

module.exports = {
  before: {
    all: [],
    find: [
      hook => find2(hook)
    ],
    get: [],
    create: [
      hook => modify(hook)
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

var find2 = async(function(hook) {
  hook.params.paginate = {default: 1000, max: 1000 };
});


var modify = async(function(hook) {
  let obj = [];
  let oldObj = [];
  // let id = [];
  // let flag = true;
  let module = hook.data.module.toLowerCase();

  var tdata = await(hook.app.service('/register-roles').find({
    query: {
      $limit: 50,
      module: module
    }
  }));
  let roleData = tdata.data;
  for(let i=0 ;i<hook.data.roles.length;i++) {
    let role = hook.data.roles[i].toLowerCase();
    let regExpmainPlan = new RegExp('^' + role, 'i');
    let findObj = roleData.find((o) => { return regExpmainPlan.test(o.role); });
    if (!findObj) {
      obj.push({'module':module,'role':role});
    } else {
      oldObj.push({'module':module,'role':role});
    }
  }

  if(tdata.data.length != 0) {
    for(let i=0;i<tdata.data.length;i++) {
      let regExpmainPlan = new RegExp('^' + tdata.data[i].role, 'i');
      let findObj = oldObj.find((o) => { return regExpmainPlan.test(o.role); });
      if (!findObj) {
        hook.app.service('/register-roles').remove(tdata.data[i].id).then(result => {
          console.log('result....',result); //eslint-disable-line no-console
        });
      }
    }
  }
  hook.data = obj;
});
