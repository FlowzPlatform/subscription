<template>
	<div class="checkout">
    <div class="container">
      <div class="row">
          <div class="col-md-2"></div>
          <div class="col-md-8">
              <div class="page-header">
              </div>
          </div>
      </div>
      <div class="row">
          <div class="col-md-2"></div>
          <div class="col-md-8">
              <div v-if="payDone" :class="payInfo.class">
                <strong>{{payInfo.msgType}}</strong> {{payInfo.msg}}.
              </div>
              <div class="panel panel-custom" style="">
                  <div class="panel-heading">
                      <h3 class="text-center">Payment Details</h3></div>
                  <div class="panel-body" style="text-allign:left">
                      <form role="form">
                        <div class="form-group">
                            <!-- <select v-model="payDetail.cardType" class="form-control" name="cardtype" id="cardType" style="margin-bottom: 15px">
                                <option name="" value="0">Select Card Type</option>
                                <option name="Visa" value="Visa">Visa</option>
                                <option name="MasterCard" value="MasterCard">MasterCard</option>
                                <option name="RuPay" value="RuPay">RuPay</option>
                                <option name="Maestro" value="Maestro">Maestro</option>
                                <option name="American Express" value="American Express">American Express</option>
                            </select> -->
                        </div>
                        <div class="form-group" style="text-align:left"> CARD NUMBER
                            <div>
                                <input v-model="payDetail.cardNumber" type="text" class="form-control" id="cardNumber" placeholder="Valid Card Number" required autofocus/> </div>
                        </div>
                        <div class="row">
                            <div class="col-xs-7 col-md-7">
                                <div class="form-group" style="text-align:left">EXPIRY DATE
                                  <div class="row">
                                    <div class="col-xs-6 col-lg-6 col-md-6">
                                        <input v-model="payDetail.expiryMM" type="text" class="form-control" id="expiryMonth" placeholder="MM" required/>
                                    </div>
                                    <div class="col-xs-6 col-lg-6 col-md-6">
                                        <input type="text" v-model="payDetail.expiryYY" class="form-control" id="expiryYear" placeholder="YY" required/>
                                    </div>
                                  </div>
                                </div>
                            </div>
                            <div class="col-xs-5 col-md-5 pull-right">
                                <div class="form-group"  style="text-align:left"> CV CODE
                                    <input type="password" v-model="payDetail.cvCode" class="form-control" id="cvCode" placeholder="CV" required/> </div>
                            </div>
                        </div>
                    </form>
                  </div>
                  <div class="panel-footer">
                      <div class="row" style="padding:10px">
                        <div class="col-xs-6 col-md-6">
                            <a class="btn btn-lg btn-block btn-default" @click="backFunction()">Back</a>
                        </div>
                        <div class="col-xs-6 col-md-6">
                            <a class="btn btn-lg btn-block btn-success" @click="payFunction()">PAY</a>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
    <!-- {{payDetail}}{{sub_id}} -->
  </div>
</template>
<script>
// import api from '@/api'
// import axios from 'axios'
import defaultSubscription from '@/api/default-subscription'
import checkoutApi from '@/api/checkout'
import axios from 'axios'
import config from '@/config'
let baseUrl = config.serverURI

export default {
  name: 'checkout',
  components: {
  },
  data () {
    return {
      payDetail: {
        cardType: '0',
        cardNumber: '',
        expiryMM: '',
        expiryYY: '',
        cvCode: ''
      },
      sub_id: '',
      login_token: '',
      payDone: false,
      payInfo: {
        msgType: '',
        msg: '',
        class: ''
      }
    }
  },
  mounted () {
    this.sub_id = this.$route.params.id
  },
  methods: {
    backFunction () {
      this.$router.push('/')
    },
    payFunction () {
		let self = this
		let auth_token = this.$cookie.get('auth_token')
			// console.log("++++++++++++",this.$cookie.get('auth_token'));
      var sObj = {
        sub_id: this.sub_id,
        login_token: this.login_token,
        payDetail: this.payDetail
      }

			axios({
							method:'post',
							url: baseUrl + "/checkout",
							headers: {'authorization': auth_token},
							data:sObj
						}).then(res => {
							// console.log("response.....",res)
							this.payDone = true
			        if (res.data.hasOwnProperty('error')) {
			          this.payInfo.class = 'alert alert-danger'
			          this.payInfo.msgType = 'Error!'
			          this.payInfo.msg = 'Payment Not Done.'
			        } else {
			          this.payInfo.class = 'alert alert-success'
			          this.payInfo.msgType = 'Success!'
			          this.payInfo.msg = 'Payment successfully Done.'
			        }

					 })
					 .catch(function (error) {
						 console.log("**********",error)
						 self.$Notice.error({
								 duration: 5,
								 title: 'Please check...some error'
						 });
					 });
      // checkoutApi.post(sObj).then(res => {
      //   console.log('RESPONSE', res)
      //   this.payDone = true
      //   if (res.data.hasOwnProperty('error')) {
      //     this.payInfo.class = 'alert alert-danger'
      //     this.payInfo.msgType = 'Error!'
      //     this.payInfo.msg = 'Payment Not Done.'
      //   } else {
      //     this.payInfo.class = 'alert alert-success'
      //     this.payInfo.msgType = 'Success!'
      //     this.payInfo.msg = 'Payment successfully Done.'
      //   }
      // })
      // .catch(err => {
      //   console.log('Error', err)
      // })
    }
  },
  'watch': {
    '$route.params.id': function(newId, oldId) {
      this.sub_id = newId
    }
  }
}
</script>
<style scoped>
  .panel-custom {
    border-color: #000044;
  }
  .panel-custom > .panel-heading {
    color: #fff;
    background-color: #000044;
    border-color: #000044;
  }
</style>
