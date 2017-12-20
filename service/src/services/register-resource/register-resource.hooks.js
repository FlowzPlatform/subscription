
const _ = require('lodash');
var r = require('rethinkdbdash');
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
  console.log("***********hook",hook.data)
  console.log("***********hook",hook.params)
  let obj = {}
  let flag = true
  let id = ''
  let module = hook.data.module.toLowerCase()
  let service = hook.data.service.toLowerCase()
  console.log("++++++++++++++++++",module,service)
  obj[module] = {}
  obj[module][service] = {}

  var tdata = await(hook.app.service('/register-resource').find())

  console.log('tdata', tdata)

  if(tdata.data.length != 0){
  for(let [i, mObj] of tdata.data.entries()) {
    console.log(mObj.hasOwnProperty(module) ,mObj[module],mObj)
    if(mObj.hasOwnProperty(module)){
       if(mObj[module].hasOwnProperty(service)){
         console.log("yes",mObj)
         id = mObj.id
         for(let key in hook.data.actions[0]) {
           let key1 = key.toLowerCase()
           let action1 = hook.data.actions[0][key].toLowerCase()
           console.log("key1.action1",key1,action1)
           obj[module][service][key1] = action1
         }
         hook.app.service('/register-resource').update(id,obj).then(result => {
             console.log("result....",result)
         });
           flag = false
       }
       else{
         for(let key in hook.data.actions[0]) {
           let key1 = key.toLowerCase()
           let action1 = hook.data.actions[0][key].toLowerCase()
           console.log("key1.action1",key1,action1)
           obj[module][service][key1] = action1
         }
       }

    }
    else{
      for(let key in hook.data.actions[0]) {
        let key1 = key.toLowerCase()
        let action1 = hook.data.actions[0][key].toLowerCase()
        console.log("key1.action1",key1,action1)
        obj[module][service][key1] = action1
      }
    }
  }
 }
 else{
   for(let key in hook.data.actions[0]) {
     let key1 = key.toLowerCase()
     let action1 = hook.data.actions[0][key].toLowerCase()
     console.log("key1.action1",key1,action1)
     obj[module][service][key1] = action1
   }
 }
 if(flag == true){
   console.log("true.......")
   hook.data = obj
 }
 else{
   console.log("false.....")
   hook.data = []
   hook.result = {"data":"updated"}
 }
})


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
