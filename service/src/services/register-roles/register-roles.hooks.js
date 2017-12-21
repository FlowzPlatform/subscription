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
  let id = ''
  let module = hook.data.module.toLowerCase()
  console.log("module......",module)

  obj["module"] = module
  obj["roles"] = hook.data.roles

  var tdata = await(hook.app.service('/register-roles').find())
  console.log("tdata....",tdata)

  if(tdata.data.length != 0){
    for(let [i, mObj] of tdata.data.entries()) {
      if(mObj["module"] == module){
          id = mObj.id
          hook.app.service('/register-roles').update(id,obj).then(result => {
              console.log("result....",result)
          });

          hook.data = []
          hook.result = {"data":"updated"}
      }
      else {
         hook.data = obj
      }
    }
  }
  else {
    hook.data = obj
  }
})
