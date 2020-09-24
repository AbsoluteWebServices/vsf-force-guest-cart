import Vue from 'vue'
import coreActions from '@vue-storefront/core/modules/cart/store/actions'

const setToken = async () => {
  const params = new URLSearchParams(location.search)

  if (!params.has('__ct')) {
    return
  }

  const token = params.get('__ct')
  const cache = Vue.prototype.$db.cartsCollection

  await cache.setItem('current-cart-token', token)
}

const extendCartVuex = {
  actions: {
    coreLoad: coreActions.load,
    async load ({ dispatch }, { forceClientState = false }: {forceClientState?: boolean} = {}) {
      await setToken()
      return dispatch('coreLoad', { forceClientState })
    }
  }
}

export const cartExtend = {
  key: 'cart',
  store: { modules: [{ key: 'cart', module: extendCartVuex }] }
}
