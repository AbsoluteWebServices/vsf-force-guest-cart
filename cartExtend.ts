import Vue from 'vue'
import coreActions from '@vue-storefront/core/modules/cart/store/actions'
import * as coreTypes from '@vue-storefront/core/modules/cart/store/mutation-types'
import { getProducts } from './helpers'

const setToken = async (context) => {
  const params = new URLSearchParams(location.search)

  if (!params.has('__ct')) {
    return
  }

  const token = params.get('__ct')
  const cache = Vue.prototype.$db.cartsCollection

  await cache.setItem('current-cart-token', token)
  await cache.setItem('external-cart-token', token)
  await cache.setItem('current-cart-hash', null)
  await cache.setItem('current-cart', null)

  if (params.has('__ci')) {
    const ci: any = params.get('__ci')
    let items
    const cartItems = []

    if (typeof ci === 'string') {
      items = ci.split(',')
    } else {
      for (const element of ci) {
        items = items.concat(element.split(','))
      }
    }

    for (const item of items) {
      if (item.indexOf(':') === -1) {
        cartItems.push({
          sku: item,
          qty: 1
        })
      } else {
        const elements = item.split(':')

        cartItems.push({
          id: elements[0],
          sku: elements[1],
          qty: parseInt(elements[2])
        })
      }
    }

    await cache.setItem('current-cart', cartItems)

    const fetchProductsInfo = async () => {
      const products = await getProducts(cartItems.map(item => item.sku))
      return Promise.all(products.map(product => context.dispatch('updateItem', { product })))
    }

    fetchProductsInfo()
  }
}

const extendCartVuex = {
  actions: {
    coreLoad: coreActions.load,
    async load (context, { forceClientState = false }: {forceClientState?: boolean} = {}) {
      await setToken(context)
      return context.dispatch('coreLoad', { forceClientState })
    },
    async isExternalCart ({ getters }) {
      const externalCartToken = await Vue.prototype.$db.cartsCollection.getItem('external-cart-token')
      if (!externalCartToken) return false
      return getters.getCartToken === externalCartToken
    }
  },
  mutations: {
    [coreTypes.CART_UPD_ITEM_PROPS] (state, { product }) {
      let record = state.cartItems.find(p => (p.sku === product.sku || (p.server_item_id && p.server_item_id === product.server_item_id)))
      if (record) {
        Vue.prototype.$bus.$emit('cart-before-itemchanged', { item: record })
        Object.entries(product).forEach(([key, value]) => Vue.set(record, key, value))
        Vue.prototype.$bus.$emit('cart-after-itemchanged', { item: record })
      }
    }
  }
}

export const cartExtend = {
  key: 'cart',
  store: { modules: [{ key: 'cart', module: extendCartVuex }] }
}
