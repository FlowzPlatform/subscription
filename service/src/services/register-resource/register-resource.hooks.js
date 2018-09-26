/*eslint no-console: ["error", { allow: ["warn","log"] }] */
let async = require('asyncawait/async');
let await = require('asyncawait/await');

module.exports = {
  before: {
    all: [
    ],
    find: [
      hook => find2(hook)
    ],
    get: [
    ],
    create: [
      hook => modify(hook)
    ],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [
    ],
    find: [],
    get: [
    ],
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


var modify = async(function(hook) {
  let obj = [];
  let oldObj = [];
  // let id = [];
  // let flag = true;
  let module = hook.data.module.toLowerCase();

  var tdata = await(hook.app.service('/register-resource').find({
    query: {
      $limit: 50,
      module: module
    }
  }));

  let resourceData = tdata.data;
  for(let key in hook.data.services) {
    key = key.toLowerCase();
    let regExpmainPlan = new RegExp('^' + key, 'i');
    let findObj = resourceData.find((o) => { return regExpmainPlan.test(o.service); });
    let actionKey = hook.data.services[key].map((obj) => { return {[obj]:obj};});
    if (!findObj) {
      obj.push({'module':module,'service':key,'actions': actionKey });
    } else {
      oldObj.push({'module':module,'service':key,'actions': actionKey});
    }
  }

  if(tdata.data.length != 0) {
    for(let i=0;i<tdata.data.length;i++) {
      let regExpmainPlan = new RegExp('^' + tdata.data[i].service, 'i');
      let findObj = oldObj.find((o) => { return regExpmainPlan.test(o.service); });
      if (!findObj) {
        hook.app.service('/register-resource').remove(tdata.data[i].id).then(result => {
          console.log('result....',result); //eslint-disable-line no-console
        });
      } else {
        hook.app.service('/register-resource').patch(tdata.data[i].id,findObj).then(result => {
          console.log('result....',result); //eslint-disable-line no-console
        });
      }
    }
  }
  console.log('=======',obj);
  hook.data = obj;
});


var find2 = async(function(hook) {
  if (hook.params.query.module === undefined) {
    hook.params.query.module = {$in: ['uploader', 'webbuilder', 'crm', 'subscription','vshopdata', 'vmail', 'dbetl', 'mom', 'workflow']};
  }
  hook.params.paginate = {default: 1000, max: 1000 };
  if(hook.params.query != undefined){
    // console.log("called....")
    if(hook.params.query.method  && hook.params.query.route && hook.params.query.module){
      let p_module1 = hook.params.query.module.toLowerCase();
      let p_method1 = hook.params.query.method.toLowerCase();
      let p_route1 = hook.params.query.route.toLowerCase();
      // console.log("&&&&&&&&&&&&&&&",hook.params.query)
      var tdata1 = await(hook.app.service('/register-resource').find());
      // console.log('tdata', tdata1)
      if(tdata1.data.length != 0){
        for(let [i, mObj] of tdata1.data.entries()) { // eslint-disable-line no-unused-vars
          // console.log("mObj.actions",mObj.actions)
          if(mObj.module == p_module1){
            for(let key in mObj.actions[0])
            {
              // console.log(key,mObj.actions[0][key])
              if(p_method1 == key && p_route1 == mObj.actions[0][key]){
                hook.result = mObj;
              }
            }
          }
        }

      }
    }
  }
});





// function modify (hook) {
// 	return new Promise ((resolve,reject) => {
// 		console.log("***********hook",hook.data)
//     console.log("***********hook",hook.params)
//     let obj = {}
//     obj[hook.data.module] = {}
//     obj[hook.data.module][hook.data.service] = {}
//
//     var connection = null;
//     r.connect( {host: 'localhost', port: 28015, db: 'subscription' }, function(err, conn) {
//       if (err) throw err;
//       connection = conn;
//        r.db('subscription').table('register_resource').run(connection, function(err, result) {
//           if (err) throw err;
//           console.log(JSON.stringify(result, null, 2));
//       })
//    })
//
//
//
//
//
//     _.forEach(hook.data.actions[0], function(action, action_key) {
//         obj[hook.data.module][hook.data.service][action_key] = action
//     })
//
//     console.log("obj....",obj)
//
//     hook.data = obj
//
// 		resolve(hook)
// 	})
// }
