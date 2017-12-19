
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
  obj[hook.data.module] = {}
  obj[hook.data.module][hook.data.service] = {}
  var conn = require('rethinkdbdash')({
    host: 'localhost', port: 28015, db: 'subscription'
  })
  var tdata = await (conn.table('register_resource').run())
  console.log('tdata', tdata)

  if(tdata.length != 0){
  for(let [i, mObj] of tdata.entries()) {
    console.log(mObj.hasOwnProperty(hook.data.module) ,mObj[hook.data.module],mObj)
    if(mObj.hasOwnProperty(hook.data.module)){
       if(mObj[hook.data.module].hasOwnProperty(hook.data.service)){
         console.log("yes")
         flag = false
       }
       else{
         for(let key in hook.data.actions[0]) {
           obj[hook.data.module][hook.data.service][key] = hook.data.actions[0][key]
         }
       }

    }
    else{

      for(let key in hook.data.actions[0]) {
        obj[hook.data.module][hook.data.service][key] = hook.data.actions[0][key]
      }
    }
  }
 }
 else{
   for(let key in hook.data.actions[0]) {
     obj[hook.data.module][hook.data.service][key] = hook.data.actions[0][key]
   }
 }
 if(flag == true){
   console.log("true.......")
   hook.data = obj
 }
 else{
   console.log("false.....")
   hook.data = []
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
