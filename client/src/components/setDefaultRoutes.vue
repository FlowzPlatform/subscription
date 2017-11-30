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
                <div class="col-md-6" v-if="currentOpen == pIndex" @click="expand(pIndex)">
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
        <div v-for="(service, sIndex) in plan.services">
          <div class="container outer-main">
            <div class="row">
              <div class="col-md-12 service-header">
                <div class="row">
                  <div class="col-md-12">
                    <h3>Service: {{service.name}}</h3>
                  </div>
                </div>
              </div>
            </div>
            <div v-for="(route, rIndex) in service.routes">
              <div class="row">
                <div class="col-md-12 route-header">
                  <div class="row">
                    <div class="col-md-12">
                      <h4>Route: {{route.name}}</h4>
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="(method, mIndex) in route.methods">
                <div class="row method">
                  <div class="col-md-4 method-name">
                    {{method.name}}
                  </div>
                  <div class="col-md-8">
                    <div class="row">
                      <div class="col-md-9">
                        {{method.description}}
                      </div>
                      <div class="col-md-3">
                        <input type="text" class="input-default-value" name="value" v-model="method.value" min=0 :id="service.name + '_' + route.name + '_' + method.name" placeholder="enter value"></input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import axios from "axios";
// let baseUrl = process.env.baseUrl;
let baseUrl = 'http://172.16.230.253:3030'
import 'vue-awesome/icons'
import $ from 'jquery'
Vue.component('icon', Icon)
export default {
  name: 'setDefaultRoutes',
  components: {vSelect},
  data(){
    return {
      services: [],
      plans: [],
      currentOpen: -1,
      time_units: ['day/s', 'month/s', 'year/s']
    }
  },
  created()  {
    axios.get(baseUrl+"/default-subscription").
    then((response) => {
      if (response.data.data.length > 0) {
        this.planExists = true
        for (var i = 0; i < response.data.data.length; i++) {
          this.plans.push(response.data.data[i])
        }
      }
    })
  },
  methods: {
    createPlan () {
      let services = []
      axios.get(baseUrl+"/secure-routes").
      then((response) => {
        for (var i = 0; i < response.data.data.length; i++) {
          services.push(response.data.data[i])
        }
      })
      this.plans.push({
        name: '',
        time_unit: 'days',
        services: services
      })
    },
    deletePlan (plan) {
      this.plans.splice(plan, 1)
    },
    expand (plan) {
      $('#plan_'+plan).slideToggle(700)
      if (this.currentOpen == plan) {
        this.currentOpen = -1
      }
      else {
        if (this.currentOpen != -1) {
          $('#plan_'+this.currentOpen).slideToggle(450)
        }
        this.currentOpen = plan
      }
    },
    update () {
      axios.delete(baseUrl+"/default-subscription").
      then((response) => {
        axios.post(baseUrl+"/default-subscription", this.plans).
        then((response) => {
          console.log(response)
        })
      })
    }
  }
}
</script>

<style scoped>
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
</style>
