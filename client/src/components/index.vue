<template>
  <div>
    <div class="container">
      <div align="center" style="margin-top: 10px;">
        <span class="viewChange1" @click="setView('subscriptionList')">Subscription-List</span>
        &nbsp;&nbsp;&nbsp;
        <span class="viewChange1" @click="setView('secureRoutes')">secure-routes</span>
        &nbsp;&nbsp;&nbsp;
        <span class="viewChange1" @click="setView('setDefaultRoutes')">set-default-routes</span>
      </div>
      <component :is="viewStyle"></component>
    </div>
  </div>
</template>

<script>
import secureRoutes from './secureRoutes.vue'
import setDefaultRoutes from './setDefaultRoutes.vue'
import subscriptionList from './subscriptionList.vue'
export default {
  name: 'index',
  components: {
    secureRoutes, setDefaultRoutes, subscriptionList
  },
  data(){
    return {
      viewStyle: 'secureRoutes',
    }
  },
  methods: {
    setView(option){
      console.log(option);
      this.viewStyle = option;
    }
  }
}
</script>

<style scoped>

  .container {
    padding: 0px;
    margin: 0px;
    width: 100%;
  }

  .bottom-click {
    position:fixed;
    bottom:0%;
    right:50%;
    left:50%;
    margin-left: -50px;
    width: 100px;
  }


  .viewChange1:hover {
    cursor: pointer;
    color: blue;
  }

  /*.viewChange2:hover {
    cursor: pointer;
    color: blue;
  }
*/
</style>
