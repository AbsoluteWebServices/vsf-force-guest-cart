import { createModule } from '@vue-storefront/core/lib/module'
import { beforeEachGuard } from './router/beforeEach'

const KEY = 'vsf-force-guest-cart'
export const VsfForceGuestCart = createModule({
  key: KEY,
  router: { beforeEach: beforeEachGuard }
})

export { cartExtend } from './cartExtend'
