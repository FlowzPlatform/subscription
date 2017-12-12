import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index'
import secureRoutes from '@/components/secureRoutes'
import setDefaultRoutes from '@/components/setDefaultRoutes'
import subscriptionList from '@/components/subscriptionList'
import checkout from '@/components/checkout'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/secureRoutes',
      name: 'secureRoutes',
      component: secureRoutes
    },
    {
      path: '/setDefaultRoutes',
      name: 'setDefaultRoutes',
      component: setDefaultRoutes
    },
    {
      path: '/subscriptionList',
      name: 'subscriptionList',
      component: subscriptionList
    },
    {
      path: '/checkout/:id',
      name: 'checkout',
      component: checkout,
      props: {
        id: Text,
        required: false
      }
    }
  ]
})
