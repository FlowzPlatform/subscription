module.exports = {
  before: {
    all: [],
    find: [
      hook => find2(hook)
    ],
    get: [
      hook => find2(hook)
    ],
    create: [
      hook => modify(hook)
    ],
    update: [
      hook => modify(hook)
    ],
    patch: [hook => modify(hook)],
    remove: [hook => modify(hook)]
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

let find2 = (hook) => {
  if (hook.params.query.module === undefined) {
    hook.params.query.module = {$in: ['uploader', 'webbuilder', 'crm', 'subscription','vshopdata', 'vmail', 'dbetl', 'mom']};
  }
  hook.params.paginate = {default: 1000, max: 1000};
};

let modify = (hook) => {
  hook.result = 'unable to modify data';
  return hook;
};
