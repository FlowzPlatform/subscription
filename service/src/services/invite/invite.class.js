const axios = require('axios');
const Ajv = require('ajv');
const ajv = new Ajv();
const _ = require('lodash');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
let emailTemp = require('../emailTemplate');
let SendEmailBodyInvite = emailTemp.sendInviteemail;
let SendEmailBodyDecline = emailTemp.sendDeclineemail;

let domainKey = process.env.domainKey;
let baseUrl = 'https://api.'+ domainKey;

let schemaName = {
  'properties': {
    'fromEmail': {
      'type': 'string'
    },
    'toEmail': {
      'type': 'string'  
    },
    'subscriptionId': {
      'description': 'subscriptionId'
    },
    'role': {
      'type' : 'object',
      'description': 'role'
    }
  },
  'required': ['fromEmail', 'toEmail' ,  'subscriptionId' , 'role'],
  'additionalProperties': true
};

class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup(app){
    this.app = app;
  }
  /* eslint-disable no-unused-vars */
  find (params) {
    return Promise.resolve([]);
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }
  /* eslint-disable no-unused-vars */ 

  create (data, params) {
    let self = this;
    let previous_packages ;
    let userId;
    let module = data.module;
    let subscriptionId = data.subscriptionId;
    let Role1 = data.role;
    let name = data.name;
    this.validateSchema(data, schemaName);
    return new Promise((resolve , reject ) => {
      axios.post(baseUrl+'/auth/api/userdetailsbyemail', {
        'email': data.toEmail
      }).then((res) => {
        userId = res.data.data[0]._id;
        previous_packages = res.data.data[0].package;
        if(previous_packages == undefined || previous_packages.length == 0){
          previous_packages = {
            [subscriptionId] : {
              'subscriptionId': subscriptionId,
              'role': Role1,
              'name' : name,
              'createdAt': new Date(),
              'invitedBy': data.fromEmail
            }
          };
        } else {
          if (previous_packages[subscriptionId] != undefined) {
            _.forIn(Role1, function (value, key) {
              previous_packages[subscriptionId].role[key] = value;
            });
          } else {
            previous_packages[subscriptionId] = {
              'subscriptionId': subscriptionId,
              'role': Role1,
              'name': name,
              'createdAt': new Date(),
              'invitedBy': data.fromEmail
            };
          }
          // previous_packages[subscriptionId].role = _.omit(previous_packages[subscriptionId].role, Role1);
        }
        /* eslint-disable no-undef */
        if(!params.headers || !params.headers.authorization){
          let errorObj = {
            statusText: 'missing Authorization header',
            status: 404,
            data: '\'Auth token is required in header\''
          };
          resolve (errorObj);
        }
        // let user = await (self.updateuserdetails(userId,previous_packages,params));

        return self.updateuserdetails(userId,previous_packages,params).then(r=>{
          return {res:res,userDetail:r};
        });

        // axios.put(baseUrl+'/user/updateuserdetails/' + userId, { package: previous_packages }, { headers: { 'Authorization': params.headers.authorization } })
        //   .then(async ((result) => {
        //     if (result.data.code == 201) {
        //       let subscription_invite = await (self.subscription_invitation(data, res, params ));
        //       self.sendEmail(data, res, params.headers.authorization);
        //     }
        //     resolve(result.data); 
        //   })).catch((err) => {
        //     let errorObj = {};
        //     errorObj.statusText = err.response.statusText;
        //     errorObj.status = err.response.status;
        //     errorObj.data = err.response.data;
        //     resolve (errorObj);
        //   /* eslint-disable no-undef */
        //   });
      }).then(result=>{
        let userDetailResult=result.userDetail;
        let res=result.res;
        if (userDetailResult.data.code == 201) {
          let subscription_invite = self.subscription_invitation(data, res, params );
          self.sendEmail(data, res, params.headers.authorization);
        }
        resolve(userDetailResult.data);
      }).catch((err) => {
        // let errorObj = {};
        // errorObj.statusText = 'Not Found';
        // errorObj.status = 404;
        // errorObj.data = 'No data found with this email ID';
				console.log('Invite Create Catch:: ', err) // eslint-disable-line
        let errorObj = {};
        errorObj.statusText = err.response.statusText;
        errorObj.status = err.response.status;
        errorObj.data = err.response.data;
        resolve(errorObj);
      });
    });
  }
	
  updateuserdetails(userId,previous_packages,params){
    return axios.put(baseUrl+'/user/updateuserdetails/' + userId, { package: previous_packages }, { headers: { 'Authorization': params.headers.authorization } })
      .then(((result) => {
        return result; 
      })).catch((err) => {
        let errorObj = {};
        errorObj.statusText = err.response.statusText;
        errorObj.status = err.response.status;
        errorObj.data = err.response.data;
        throw(errorObj);
        /* eslint-disable no-undef */
      });
  }

  subscription_invitation(data, res, params) {
    let self = this;
    return this.app.service('subscription-invitation').find({query : { 'toEmail': data.toEmail, 'subscriptionId': data.subscriptionId, 'isDeleted': false }, headers: { 'Authorization': params.headers.authorization }})
      .then(function (response) {
        if (response.data.length == 0) {
          return self.app.service('subscription-invitation').create(data).then(function (response){
          }).catch(function(err){
            throw(err);
          });
        } else {
          response.data[0].isDeleted = true;
          return self.app.service('subscription-invitation').patch(response.data[0].id, response.data[0] , '').then(function (response2) {
            // console.log('response2-----' ,response2);
            self.app.service('subscription-invitation').create(data).then(function (response) {
            }).catch(function (err) {
              throw(err);
            });
          }).catch(function (err) {
            throw(err);
          });
        }
      }).catch(function (err) {
        throw(err);
      });
  }
	
  sendEmail(data, res, authToken) {
    let SendEmailBody = SendEmailBodyInvite.replace(/WriteSenderNameHere/i, data.fromEmail);
    SendEmailBody = SendEmailBody.replace(/DOMAIN/g, 'https://www.dashboard.' + domainKey);
    SendEmailBody = SendEmailBody.replace(/SYSTEMNAME/g, Object.keys(data.role)[0]);
    SendEmailBody = SendEmailBody.replace(/ROLE/g, Object.values(data.role)[0]);
   
    axios({ method: 'post',
      url: baseUrl+'/vmailmicro/sendEmail',
      headers: {'Authorization': authToken},
      data: { 'to': data.toEmail, 'from': data.fromEmail, 'subject': 'Invitation from Flowz', 'body': SendEmailBody} }).then(async ((result) => {
      return true;
    })).catch(function(err){
      return err;
    });
  }

  sendDeclineEmail(params, res, authToken) {
    var SendEmailBody = SendEmailBodyDecline.replace(/WriteSenderNameHere/i, params.query.fromEmail);
    SendEmailBody = SendEmailBody.replace(/DOMAIN/g, 'https://www.dashboard.' + domainKey);
    SendEmailBody = SendEmailBody.replace(/SYSTEMNAME/g, Object.keys(params.query.role)[0]);
    SendEmailBody = SendEmailBody.replace(/ROLE/g, Object.values(params.query.role)[0]);
    axios({
      method: 'post',
      url: baseUrl + '/vmailmicro/sendEmail',
      headers: { 'Authorization': authToken },
      data: { 'to': params.query.toEmail, 'from': params.query.fromEmail, 'subject': 'Your role is now no longer with Flowz.', 'body': SendEmailBody }
    }).then(async ((result) => {
      return true;
    })).catch(function (err) {
      return err;
    });
  }

  validateSchema(data, schemaName) {
    let validateSc = ajv.compile(schemaName);
    let valid = validateSc(data);
    if (!valid) {
      throw new errors.NotAcceptable('user input not valid', validateSc.errors);
    }
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    let previous_packages;
    let userId;
    let subscriptionId = params.query.subscriptionId;
    let Role1 = params.query.role;
    let self = this;
    return new Promise(function (resolve, reject) {
      axios.post(baseUrl + '/auth/api/userdetailsbyemail', {
        'email': params.query.toEmail
      }).then(async ((res) => {
        userId = res.data.data[0]._id;
        previous_packages = res.data.data[0].package;
        
        if (previous_packages == undefined || previous_packages.length == 0) { // eslint-disable-line no-empty
        } else {
          previous_packages[subscriptionId].role = _.omit(previous_packages[subscriptionId].role, Role1);
          if (_.isEmpty(previous_packages[subscriptionId].role) == true) {
            delete previous_packages[subscriptionId];
          }
        }
				
        if(!params.headers || !params.headers.authorization){
          let errorObj = {
            statusText: 'missing Authorization header',
            status: 404,
            data: '\'Auth token is required in header\''
          };
          resolve (errorObj);
        }
				
        axios.put(baseUrl + '/user/updateuserdetails/' + userId, { package: previous_packages }, { headers: { 'Authorization': params.headers.authorization }}).then(async ((result) => {
          let subscription_invite = await (self.subscription_invitation_remove(params, res));
          self.sendDeclineEmail(params, res, params.headers.authorization);
          resolve(result.data);
        })).catch(function (err) {
          let errorObj = {};
          errorObj.statusText = err.response.statusText;
          errorObj.status = err.response.status;
          errorObj.data = err.response.data;
          resolve(errorObj);
        });
      })).catch(function (err) {
        let errorObj = {};
        errorObj.statusText = 'Not Found';
        errorObj.status = 404;
        errorObj.data = err.response.data;
        resolve(errorObj);
      });
    });
  }

  subscription_invitation_remove(data, res) {
    this.app.service('subscription-invitation').patch(data.query.subscription_invitation_id, 
      { isDeleted: true }, data.query).then(function (response) {
      //return response
    }).catch(function (err) {
      return err;
    });
  }

}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
