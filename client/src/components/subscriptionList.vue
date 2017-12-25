<template>
	<div class="subscriptionList">
		<div class="container">
      <div class="row">
          <div class="col-md-12">
              <div class="page-header">
              </div>
          </div>
      </div>
      <div class="row">
          <div class="col-md-4" v-for="(item, index) in mainData">
              <div class="panel panel-info">
                  <div class="panel-heading">
                      <h3 class="text-center">{{item.name.toUpperCase()}}</h3></div>
                  <div class="panel-body text-center">
                      <p class="lead" style="font-size:40px"><strong>${{item.price}} / {{item.validity}} {{item.time_unit}}</strong></p>
                  </div>
                  <ul class="list-group list-group-flush text-center">
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> Personal use</li>
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> Unlimited projects</li>
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> 27/7 support</li>
                  </ul>
                  <div class="panel-footer">
                      <a class="btn btn-lg btn-block btn-danger" @click="checkoutFunction(item.id)">SUBSCRIBE !</a>
                  </div>
              </div>
          </div>
          <!-- <div class="col-md-4">
              <div class="panel panel-info">
                  <div class="panel-heading">
                      <h3 class="text-center">PRO PLAN</h3></div>
                  <div class="panel-body text-center">
                      <p class="lead" style="font-size:40px"><strong>$10 / month</strong></p>
                  </div>
                  <ul class="list-group list-group-flush text-center">
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> Personal use</li>
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> Unlimited projects</li>
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> 27/7 support</li>
                  </ul>
                  <div class="panel-footer">
                      <a class="btn btn-lg btn-block btn-danger" href="https://creativemarket.com/artlabs/12114-Bootstrap-3.0.-pricing-tables-flat">BUY NOW!</a>
                  </div>
              </div>
          </div>
          <div class="col-md-4">
              <div class="panel panel-success">
                  <div class="panel-heading">
                      <h3 class="text-center">FREE PLAN</h3></div>
                  <div class="panel-body text-center">
                      <p class="lead" style="font-size:40px"><strong>$10 / month</strong></p>
                  </div>
                  <ul class="list-group list-group-flush text-center">
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> Personal use</li>
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> Unlimited projects</li>
                      <li class="list-group-item"><i class="icon-ok text-danger"></i> 27/7 support</li>
                  </ul>
                  <div class="panel-footer">
                      <a class="btn btn-lg btn-block btn-danger" href="https://creativemarket.com/artlabs/12114-Bootstrap-3.0.-pricing-tables-flat">BUY NOW!</a>
                  </div>
              </div>
          </div> -->
      </div>
    </div>
	</div>
</template>
<script>
import defaultSubscription from '@/api/default-subscription'
import axios from 'axios'
import config from '@/config'
let baseUrl = config.serverURI

  export default {
    name: 'subscriptionList',
    data () {
      return {
        mainData: []
      }
    },
    methods: {
      init () {
        // defaultSubscription.get().then(res => {
        //   console.log('response defaultSubscription', res.data.data)
        //   this.mainData = res.data.data
        // })
        // .catch(err => {
        //   console.log('Error', err)
        // })

				  axios({
									method:'get',
									url:baseUrl + "/subscription-plans"
								}).then(response => {
									console.log("response.....",response)
									for(let i=0;i<response.data.data.length;i++){
									  this.mainData.push(response.data.data[i])
								 }
							 })
							 .catch(function (error) {
								 console.log("**********",error)
								 this.$Notice.error({
										 duration: 5,
										 title: 'Please check...some error'
								 });
							 });
      },
      checkoutFunction (sub_id) {
        this.$router.push('/checkout/' + sub_id)
      }
    },
    mounted () {
      this.init()
    }
  }
</script>
<style scoped>

</style>
