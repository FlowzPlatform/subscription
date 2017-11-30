import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index'
import secureRoutes from '@/components/secureRoutes'
import setDefaultRoutes from '@/components/setDefaultRoutes'

Vue.use(Router)

export default new Router({
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
    }
  ]
})
