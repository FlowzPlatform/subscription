

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

function modify(hook){
  // console.log("hook......",hook)
  module.exports.apiHeaders = this.apiHeaders;
  // console.log("module.....",module.exports.apiHeaders.authorization)
  hook.params.query.authorization = module.exports.apiHeaders.authorization
}
