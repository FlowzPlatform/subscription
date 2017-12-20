
const _ = require('lodash');
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
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
// function modify (hook) {
//   let obj1=[]
// 	return new Promise ((resolve,reject) => {
//     console.log("hook.data..",hook.data)
//     _.forEach(hook.data, function(plan, plan_key) {
//      obj1 = []
//      let routes1 =[]
//      let method1 =[]
//      let modules1 =[]
//      let resources1=[]
//      let url1 = {}
//      let action1 = []
//
//
//       _.forEach(hook.data[plan_key].obj, function(module, module_key) {
//           _.forEach(hook.data[plan_key].obj[module_key].children, function(service, service_key) {
//               _.forEach(hook.data[plan_key].obj[module_key].children[service_key].children, function(action, action_key) {
//                   _.forEach(hook.data[plan_key].obj[module_key].children[service_key].children[action_key].children, function(url, url_key){
//                        action1.push({"route":url.title,"value":url.value})
//                   })
//                       action1[action_key]["name"] = action.title
//               })
//
//                   obj1.push({"module":module.title,"service":service.title,"actions":action1})
//                   action1 = []
//           })
//       })
//
//       console.log("obj1",obj1)
//        hook.data[plan_key].obj = obj1
//    });
//
//
// 		hook.data = hook.data
// 		resolve(hook)
// 	})
// }
