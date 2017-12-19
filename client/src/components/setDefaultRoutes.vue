<template>
  <div>
    <div class="container">
      <div class="row add-service">
        <div class="col-md-9"></div>
        <div class="col-md-3">
          <div class="col-md-8" @click="createPlan()">
            <h4>new plan</h4>
          </div>
          <div class="col-md-4 main-option" @click="update()">
            <h4>update</h4>
          </div>
        </div>
      </div>
    </div>
    <div v-for="(plan, pIndex) in plans">
      <div class="container">
        <hr>
        <div class="col-md-9">
          <div class="row">
            <div class="col-md-7">
              <div class="row">
                <div class="col-md-4 no-margin" align="right">
                  <h4>Plan Name:</h4>
                </div>
                <div class="col-md-8 no-margin">
                  <h4><input type="text" class="description" v-model="plan.name" placeholder="______________________"></h4>
                </div>
              </div>
            </div>
            <div class="col-md-5">
              <div class="row">
                <div class="col-md-4 no-margin">
                  <h4>Validity: </h4>
                </div>
                <div class="col-md-3 no-margin" align="right">
                  <h4><input type="number" title="Validity" class="description" v-model="plan.validity" min=1 placeholder="____________________"></input></h4>
                </div>
                <div class="col-md-5 no-margin" align="left">
                  <h4>days</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="row pull-right">
            <div class="col-md-4 no-margin" align="right">
              <h4>Price:</h4>
            </div>
            <div class="col-md-5 no-margin">
              <div class="row no-margin">
                <div class="col-md-2 no-margin">
                  <h4>$</h4>
                </div>
                <div class="col-md-10 no-margin">
                  <h4><input type="number" class="description" v-model="plan.price" placeholder="______________________"></input></h4>
                </div>
              </div>
            </div>
            <div class="col-md-3 options-main">
              <div class="row">
                <div class="col-md-6" @click="deletePlan(pIndex)">
                  <icon name="trash" scale="1.4"></icon>
                </div>
                <div class="col-md-6" v-if="checkOpen(pIndex)" @click="expand(pIndex)">
                  <icon name="arrow-up" scale="1.4"></icon>
                </div>
                <div class="col-md-6" v-else @click="expand(pIndex)">
                  <icon name="arrow-down" scale="1.4"></icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div :id="'plan_'+pIndex" class="outer-toggle">
        <Card>
         <!-- <Tree :data="plan.obj"></Tree> -->
         <div class="schema-form ivu-table-wrapper">
         <div class="ivu-table ivu-table-border">
                <div class="ivu-table-body">
                    <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                        <colgroup>
                            <col width="20">
                                <col width="20">
                                    <col width="20">
                                        <col width="20">
                                            <col width="20">
                        </colgroup>
                        <thead>
                            <tr>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Module</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Service</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell">
                                      <span>Operation</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell">
                                      <span>Route</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell">
                                      <span>Value</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="ivu-table-tbody">
                            <tr class="ivu-table-row" v-for="(item, index) in plan.details">
                                <td class="">
                                    <div class="ivu-table-cell">
                                      {{item.module}}
                                        <!-- <Input type="text" v-model="item.module" placeholder="Module" size="small" class="schema-form-input"></Input> -->
                                    </div>
                                </td>
                                <td class="">
                                  <div class="ivu-table-cell">
                                    {{item.service}}
                                      <!-- <Input type="text" v-model="item.service" placeholder="Module" size="small" class="schema-form-input"></Input> -->
                                  </div>
                                </td>
                                <td class="">
                                  <div class="">
                                    <div class="ivu-table-cell">
                                      {{item.action}}
                                        <!-- <Input type="text" v-model="item.action" placeholder="Module" size="small" class="schema-form-input"></Input> -->
                                    </div>
                                  </div>
                                </td>
                                <td class="">
                                  <div class="ivu-table-cell">
                                    {{item.url}}
                                      <!-- <Input type="text" v-model="item.url" placeholder="Module" size="small" class="schema-form-input"></Input> -->
                                  </div>
                                </td>
                                <td class="">
                                  <div class="ivu-table-cell">
                                        <Input type="text" v-model="item.value" placeholder="Module" size="small" class="schema-form-input" v-if="item.value == 0" ></Input>
                                      <Input type="text" v-model="item.value" placeholder="Module" size="small" class="schema-form-input redInput" v-else ></Input>
                                  </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="ivu-table-tip" style="display: none;">
                    <table cellspacing="0" cellpadding="0" border="0">
                        <tbody>
                            <tr>
                                <td><span>No filter data</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    <div class="container">
      <hr>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import vSelect from "vue-select";
import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';
import io from 'socket.io-client';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';
import vueJsonEditor from 'vue-json-editor'
Vue.use(BootstrapVue);
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import _ from 'lodash'
// let baseUrl = process.env.baseUrl;
import defaultSubscription from '@/api/default-subscription'
import secureRoutes from '@/api/secure-routes'
import axios from 'axios'
import iView from 'iview'
import locale from 'iview/dist/locale/en-US'
import 'iview/dist/styles/iview.css' // CSS
Vue.use(iView, { locale })


import 'vue-awesome/icons'
import $ from 'jquery'
let plans1 = []
Vue.component('icon', Icon)
export default {
  name: 'setDefaultRoutes',
  components: {vSelect},
  data(){
    return {
      services: [],
      plans: [],
      currentOpen: [],
      time_units: ['day/s', 'month/s', 'year/s'],
      data5: [],
      activeColor: 'red'
}
  },
  created()  {
    let data5 = []
    let self = this
    axios({
              method:'get',
              url:"http://localhost:3030/subscription-plans"
            }).then(response => {
              console.log("response.....",response)
              for(let i=0;i<response.data.data.length;i++){
               self.plans.push(response.data.data[i])
             }

              // for(let p=0;p<response.data.data.length;p++){
              //   data5=[]
              //   let module = _.uniq(_.map(response.data.data[p].obj,'module'))
              //   console.log("modules..",module)
              // // let routes =[]
              // for(let i=0;i<module.length;i++){
              //    data5.push({"title":module[i],"expand":false,"children":[]})
              //
              //     let services = _.uniq(_.map(_.filter(response.data.data[p].obj, {'module': module[i]}),'service'));
              //     console.log("services....",services)
              //     for(let j=0 ; j<services.length ;j++){
              //      data5[i]["children"].push({"title":services[j],"expand":false,children:[]})
              //      console.log("++++++++++++",data5)
              //   //  let resources = _.uniq(_.map(_.filter(modules[0][j],{'module': modules[0][j].module}),'resources'));
              //   let resources = modules[0][j].resources
              //    console.log("resources...",resources)
              //    for(let k=0 ;k<resources.length;k++){
              //      data5[i]["children"][j]["children"].push({"title":resources[k].resource,"expand":false,children:[]})
              //       // routes = _.map(_.filter(response.data.data[p].obj, {'app': app[i],'module': modules[j],'resource':resources[k]}),'routes');
              //         routes = resources[k].routes
              //       //  let uniq_routes = []
              //       //  uniq_routes = _.uniq(_.map(routes[0],'route'))
              //        for(let l=0;l<routes.length;l++){
              //         //  data5[i]["children"][j]["children"][k]["children"].push({"title":uniq_routes[l],"expand":false,children:[]})
              //           data5[i]["children"][j]["children"][k]["children"].push({"title":routes[l].route,"expand":false,children:[]})
              //         //  let methods =_.uniq(_.map(_.filter(routes[0], {'route': uniq_routes[l]}),'method'));
              //          let methods = routes[l].method
              //          console.log("methods",methods)
              //          for(let m=0;m<methods.length;m++){
              //            data5[i]["children"][j]["children"][k]["children"][l]["children"].push({"title":methods[m].name,"expand":false, "value": methods[m].value,render(h, params) {
              //              return  h('span', [
              //                h('span', methods[m].name,{
              //                  style: {
              //                    font: '18px',
              //                  }
              //                }),
              //                h('Input', {
              //                   props:{
              //                     placeholder: 'Enter value',
              //                     value: methods[m].value
              //                   },
              //                    style: {
              //                      width: '100%',
              //                      marginLeft :'60%'
              //                    },
              //                    on: {
              //                     input: (val) => {
              //                      console.log(val,i,j,k,l,m)
              //                      self.myFunction(val,i,j,k,l,m,data5)
              //                     }
              //                  }
              //                })
              //
              //            ])
              //          }})
              //          }
              //        }
              //    }
            //     }
            //   }
            //   // delete response.data.data[p].obj
            //   // response.data.data[p].obj = data5
            //   // this.plans.push(response.data.data[p])
            // }
      })
      .catch(function (error) {
        console.log("**********",error)
        self.$Notice.error({
            duration: 5,
            title: 'Please check...some error'
        });
      });
  },
  methods: {
    myFunction(val,i,filtered_index,data5,action) {
      console.log(val,i,filtered_index,data5)
      let filtered =  _.findIndex( data5[i]["children"][filtered_index]["children"],{'title':action});
      console.log("filtered",filtered)
      data5[i]["children"][filtered_index]["children"][filtered]["children"][0]["value"] = val
    },
    checkOpen (index) {
      // if (_.intersection(this.currentOpen,[index]).length > 0)) return true
      return false
    },
    checkAnyMethodAvailable (methods) {
      for (let i=0; i<methods.length; i++) {
        if (methods[i].active) return true
      }
      return false
    },
    checkAnyRouteAvailable (routes) {
      for (let i=0; i<routes.length; i++) {
        if (this.checkAnyMethodAvailable(routes[i].methods)) return true
      }
      return false
    },
    createPlan () {
      let self = this
      let data5 = []
      let keys = []
      axios({
                method:'get',
                url:"http://localhost:3030/register-resource"
              }).then(response => {
                console.log("response.....",response.data.data,response.data.data[0])

                  _.forEach(response.data.data, function(data, key) {
                    console.log("data",data)
                     for(let key in data){
                       if(key != 'id'){
                       console.log("key",key,"data",data[key])
                       for(let value in data[key]){
                         console.log("value",value,"data",data[key][value])
                         for(let route in data[key][value]){
                           console.log("value",route,"data",data[key][value][route])
                           data5.push({"module":key,"service":value,"action":route,"url":data[key][value][route],"value":0})
                         }
                       }
                     }
                      //  data5.push({"module":key,})
                     }


                  })
                // for(let i=0;i<response.data.data.length;i++){
                //   keys.push(Object.keys(response.data.data[i])[0])
                // }
                //
                // keys = _.uniq(keys)
                // console.log("keys...",keys)
                // for(let i=0;i<keys.length;i++){
                //   data5.push({"title":keys[i],"expand":false,"children":[]})
                //   for(let j=0;j<response.data.data.length;j++){
                //     console.log("j",j)
                //     let module =  Object.keys(response.data.data[j])
                //     if(keys[i] == module[0]){
                //       let service = Object.keys(response.data.data[j][module[0]])
                //       data5[i]["children"].push({"title":service[0],"expand":false,"children":[]})
                //       for(let action in response.data.data[j][module[0]][service[0]]){
                //         let route = response.data.data[j][module[0]][service[0]][action]
                //         let filtered_index =  _.findIndex(data5[i]["children"],{'title':service[0]});
                //            data5[i]["children"][filtered_index]["children"].push({"title":action,"expand":false,"children":[{
                //           "title":route,"expand":false,"value":"",render(h, params) {
                //                            return  h('span', [
                //                              h('span', route,{
                //                                style: {
                //                                  font: '18px',
                //                                }
                //                              }),
                //                              h('Input', {
                //                                 props:{
                //                                   placeholder: 'Enter value',
                //                                   value:this.value
                //                                 },
                //                                  style: {
                //                                    width: '100%',
                //                                    marginLeft :'60%'
                //                                  },
                //                                  on: {
                //                                   input: (val) => {
                //                                    console.log(val,i,filtered_index,data5)
                //                                   console.log("params",params)
                //                                    self.myFunction(val,i,filtered_index,data5,action)
                //                                   }
                //                                }
                //                              })
                //
                //                          ])
                //                        }}]})
                //           }
                //         }
                //       }
                //       }


                console.log("dataaaaaaaaaaaaaaaaaaaa",data5)
        })
        .catch(function (error) {
          console.log("**********",error)
          self.$Notice.error({
              duration: 5,
              title: 'Please check...some error'
          });
        });

        this.plans.push({
         name: '',
         validity:'',
         price:'',
         time_unit: 'days',
         details:data5
       })




    },
    deletePlan (plan) {
      this.plans.splice(plan, 1)
    },
    expand (plan) {
      $('#plan_'+plan).slideToggle(700)
    },
    update () {
      let obj1 = []
      console.log("this.plans",this.plans)
    //   for(let i=0;i<plans1.length;i++){
    //     obj1 = []
    //     for(let j=0;j<plans1[i].obj.length;j++){
    //       console.log("j",j)
    //       for(let k=0;k<plans1[i].obj[j].children.length;k++){
    //         for(let l=0;l<plans1[i].obj[j].children[k].children.length;l++){
    //          console.log(i,j,k,l)
    //          obj1.push({"app":plans1[i].obj[j].title,"module":plans1[i].obj[j].children[k].title,"resource":plans1[i].obj[j].children[k].children[l].title,"routes":[]})
    //            for(let m=0;m<plans1[i].obj[j].children[k].children[l].children.length;m++){
    //             obj1[j+k+l]["routes"].push({"route":plans1[i].obj[j].children[k].children[l].children[m].title,"method":[]})
    //             for(let n=0;n<plans1[i].obj[j].children[k].children[l].children[m].children.length;n++){
    //               obj1[j+k+l]["routes"][m]["method"].push({"name":plans1[i].obj[j].children[k].children[l].children[m].children[n].title,
    //              "value":plans1[i].obj[j].children[k].children[l].children[m].children[n].value})
    //             }
    //           }
    //       }
    //     }
    //   }
    //
    //   plans1[i].obj = obj1
    // }

    // _.forEach(plans1, function(plan, plan_key) {
    //   obj1 = []
    //   let routes1 =[]
    //   let method1 =[]
    //   let modules1 =[]
    //   let resources1=[]
    //    _.forEach(plans1[plan_key].obj, function(app, app_key) {
    //      _.forEach(plans1[plan_key].obj[app_key].children, function(module, module_key) {
    //          _.forEach(plans1[plan_key].obj[app_key].children[module_key].children, function(resources, resources_key) {
    //            _.forEach(plans1[plan_key].obj[app_key].children[module_key].children[resources_key].children, function(routes, routes_key) {
    //              _.forEach(plans1[plan_key].obj[app_key].children[module_key].children[resources_key].children[routes_key].children, function(method, method_key) {
    //                  console.log("method value..",method)
    //                  method1.push({"name":method.title,"value":method.value})
    //              })
    //              routes1.push({"route":routes.title,"method":method1})
    //              method1 =[]
    //            })
    //             resources1.push({"resource":resources.title,"routes":routes1})
    //             routes1=[]
    //
    //          })
    //            modules1.push({"module":module.title,"resources":resources1})
    //            resources1=[]
    //      })
    //            obj1.push({"app":app.title,"module":modules1})
    //            modules1=[]
    //            console.log("obj1 to be saved....",obj1)
    //    })
    //     plans1[plan_key].obj = obj1
    // });


      // defaultSubscription.delete().
      // then((response) => {
      axios({
                method:'delete',
                url:"http://localhost:3030/subscription-plans",
              }).then(response => {
                console.log("response...",response)
                axios({
                          method:'post',
                          url:"http://localhost:3030/subscription-plans",
                          data:this.plans
                        }).then(response => {
                            console.log("response...",response)
                            self.$Notice.success({
                                duration: 2,
                                title: 'Updated successfully...'
                            });
                          })
                          .catch(function (error) {
                            console.log("**********",error)
                            self.$Notice.error({
                                duration: 5,
                                title: 'Please check...some error'
                            });
                          });
              })
              .catch(function (error) {
                console.log("**********",error)
                self.$Notice.error({
                    duration: 5,
                    title: 'Please check...some error'
                });
              });
      // })

    }
  }
}
</script>

<style>
  .service-header {
    border-bottom: solid 2px #000044;
    background-color: #000044;
    color: white;
  }

  .outer-main {
    border: solid 3px #000044;
    margin-top: 10px;
    border-radius: 10px;
  }

  .outer-toggle {
    /*transition: 0.5s all linear;*/
    display: none;
  }

  .route-header {
    border-bottom: solid 2px black;
    border-top: solid 1px black
  }

  .method-name {
    border-right: solid 1px black
  }

  .method {
    border-bottom: solid 0.5px black;
    font-size: 1.5em
  }

  h3 {
    font-size: 2.5em;
    margin: 10px;
  }

  h4 {
    font-size: 2em;
    margin: 8px;
  }

  h5 {
    font-size: 1.5em;
  }

  .options {
    padding: 3px;
    border-left: dashed 1px grey;
    cursor: pointer;
  }

  .options-main {
    padding: 12px;
    border-left: dashed 1px grey;
    cursor: pointer;
  }

  input {
    border: none;
    margin: 2px;
  }

  input.description {
    width: 100%;
    margin-top: -2px;
  }

  .delete {
    margin-top: 5px;
    border-left: solid 1px #dddddd;
    cursor: pointer;
  }

  .delete-route-option {
    margin-top: 12px;
    border-left: solid 1px #dddddd;
  }

  .add-service {
    cursor: pointer;
  }

  .main-option {
    border-left: solid 1px #bbbbbb;
  }

  .input-default-value {
    width: 100%;
    border-left: solid 1px black;
    background-color: #f5f5f5;
    padding: 2px;
  }

  .no-margin {
    margin: 0px;
    padding: 0px;
  }

  hr {
    border-width: 2px;
    border-color: #888888;
  }

  hr.internal {
    border-width: 2px;
    margin: 5px;
    border-color: #888888;
  }

  div.internal {
    margin: 5px;
  }

  table {
    width: 100%
  }

  .internal2 {
    border-left: dashed 1px grey;
  }

  .ivu-tree{
    margin-right: 80%;
    text-align: left;
  }

  .ivu-card-bordered {
    border: 4px solid #dddee1;
    border-color: #072C75;
    margin-left: 25%;
    margin-right: 25%;
    margin-bottom: 1%;

}

.ivu-card-bordered:hover {
  border-color: #072C75;
  /*border: 4px solid #dddee1;*/
}

.ivu-tree-title {
    display: inline-block;
    margin: 0;
    padding: 0 4px;
    border-radius: 3px;
    cursor: pointer;
    vertical-align: top;
    color: #495060;
    transition: all .2s ease-in-out;
    font-size: 18px;
}
.ivu-tree ul {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 18px;
}
.ivu-article li:not([class^=ivu-]) {
    margin-bottom: 5px;
    font-size: 14px;
}

.ivu-tree-arrow {
    cursor: pointer;
    width: 12px;
    text-align: center;
    display: inline-block;
}

.active text-danger{
  background-color:red;
}

.redInput input {
  background-color: #ff0000;
  color: #fff;
}
</style>
