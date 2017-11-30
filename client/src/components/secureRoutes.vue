<template>
  <div>
    <div class="container">
      <div class="row pull-right add-service">
        <div class="col-md-8" @click="addService()">
          <h4>add service</h4>
        </div>
        <div class="col-md-4 main-option" @click="update()">
          <h4>update</h4>
        </div>
      </div>
    </div>
    <div v-for="(service, sIndex) in services">
      <div class="container">
        <hr>
      </div>
      <div class="container outer-main">
        <div class="row">
          <div class="col-md-12 service-header">
            <div class="row">
              <div class="col-md-10">
                <h3>Service: <input type="text" v-model="service.name" class="service-header-input" placeholder="enter service name"></h3>
              </div>
              <div class="col-md-2 pull-right options-main">
                <div class="row">
                  <div class="col-md-9">
                    <h5 @click="addRoute(sIndex)">add route</h5>
                  </div>
                  <div class="col-md-3 delete-route-option" @click="deleteService(sIndex)">
                    <icon name="trash" scale="1.4"></icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-for="(route, rIndex) in service.routes">
          <div class="row">
            <div class="col-md-12 route-header">
              <div class="row">
                <div class="col-md-10">
                  <h4>Route: <input type="text" v-model="route.name" placeholder="enter route"></h4>
                </div>
                <div class="col-md-2 pull-right options">
                  <div class="row">
                    <div class="col-md-9">
                      <h5 @click="addMethod(sIndex, rIndex)"> add method</h5>
                    </div>
                    <div class="col-md-3 delete-route-option" @click="deleteRoute(sIndex, rIndex)">
                      <icon name="trash" scale="1.1"></icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-for="(method, mIndex) in route.methods">
            <div class="row method">
              <div class="col-md-4 method-name">
                <input type="text" v-model="method.name" placeholder="method name">
              </div>
              <div class="col-md-8">
                <div class="row">
                  <div class="col-md-11">
                    <input class="description" type="text" v-model="method.description" placeholder="add description for method">
                  </div>
                  <div class="col-md-1 delete" @click="deleteMethod(sIndex, rIndex, mIndex)">
                    <icon name="trash" scale="0.8"></icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
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
  name: 'secureRoutes',
  data(){
    return {
      services: []
    }
  },
  created()  {
    console.log('created')
    axios.get(baseUrl+"/secure-routes").
    then((response) => {
      console.log(response)
      for (var i = 0; i < response.data.data.length; i++) {
        this.services.push(response.data.data[i])
      }
    })
  },
  methods: {
    addMethod (service, route) {
      this.services[service].routes[route].methods.push({name:"",description:""})
    },
    addRoute (service) {
      this.services[service].routes.push({name:"",methods:[]})
    },
    deleteMethod(service, route, method) {
      this.services[service].routes[route].methods.splice(method, 1)
    },
    deleteRoute(service, route) {
      this.services[service].routes.splice(route, 1)
    },
    deleteService(service) {
      this.services.splice(service, 1)
    },
    addService () {
      this.services.push({name:"",routes:[]})
    },
    update () {
      axios.delete(baseUrl+"/secure-routes").
      then((response) => {
        console.log(response)
        axios.post(baseUrl+"/secure-routes", this.services).
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

  .service-header-input {
    background-color: #000044;
    color: white;
  }

  .outer-main {
    border: solid 3px #000044;
    margin-top: 10px;
    border-radius: 10px;
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
    padding: 6px;
    border-left: dashed 1px grey;
    cursor: pointer;
  }

  input {
    border: none;
    margin: 2px;
  }

  input.description {
    width: 100%
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

  hr {
    border-width: 2px;
    border-color: #888888;
  }
</style>
