

module.exports = {
  before: {
    all: [],
    find: [
      hook => before_find (hook)
    ],
    get: [],
    create: [
      hook => before_create(hook)
    ],
    update: [],
    patch: [
      hook => before_patch(hook)
    ],
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


function before_create(hook) {
  hook.data.assignDate = new Date();
  hook.data.isDeleted = false;
}


function before_find(hook) {
 
  hook.params.query.isDeleted = false;  
}


function before_patch(hook) {
  
  hook.data.unassignDate = new Date(); 
}