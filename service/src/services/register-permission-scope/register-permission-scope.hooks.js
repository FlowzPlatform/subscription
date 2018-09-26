let async = require('asyncawait/async');
let await = require('asyncawait/await');

module.exports = {
  before: {
    all: [],
    find: [],
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

var modify = async(function(hook){
  // console.log('***********hook',hook.data);
  // console.log('***********hook',hook.params);
  let obj = [];
  let id = [];
  let flag = true;
  let module = hook.data.module.toLowerCase();
  // console.log('module......',module);

  for(let i=0 ;i<hook.data.permission_scope.length;i++) {
    let permission_scope = hook.data.permission_scope[i].toLowerCase();
    obj.push({'module':module,'permission_scope':permission_scope});
  }

  var tdata = await(hook.app.service('/register-permission-scope').find());
  // console.log('tdata....',tdata);

  if(tdata.data.length != 0){
    for(let [i, mObj] of tdata.data.entries()) { // eslint-disable-line no-unused-vars
      if(mObj['module'] == module){
        id.push(mObj.id);
        flag = false;
      }
      else {
        hook.data = obj;
      }
    }
  }
  else {
    hook.data = obj;
  }

  if(flag == false){
    for(let i=0;i<id.length;i++){
      hook.app.service('/register-permission-scope').remove(id[i]).then(result => {
        console.log('result....',result); // eslint-disable-line no-console
      });
    }
    hook.data = obj;
  }
});
