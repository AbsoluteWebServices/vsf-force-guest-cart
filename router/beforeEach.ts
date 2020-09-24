import { Route } from 'vue-router'
import { isServer } from '@vue-storefront/core/helpers'

export function beforeEachGuard (to: Route, from: Route, next): void {
  if (!isServer && Object.keys(to.query).length !== 0 && to.query.hasOwnProperty('__ct')) {
    delete to.query.__ct
    next(to)
  } else {
    next()
  }
}
