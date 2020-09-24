import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import { isServer } from '@vue-storefront/core/helpers'

const setToken = async () => {
  const params = new URLSearchParams(location.search)

  if (!params.has('__ct')) {
    return
  }

  const token = params.get('__ct')
  const cartCollection = StorageManager.get('cart')

  await cartCollection.setItem('current-cart-token', token)
}

export function afterRegistration () {
  if (!isServer) {
    setToken()
  }
}
