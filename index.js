import EntitySchema from 'normalizr/lib/EntitySchema'
import {normalize} from 'normalizr'

export default function normalizerMiddleware (store) {
  return next => action => {
    if (!action.meta ||
      !action.meta.schema ||
      !action.meta.schema instanceof EntitySchema ||
      !action.payload ||
      action.error
    ) {
      return next(action)
    }

    const normal = normalize(action.payload, action.meta.schema)

    delete action.meta['schema']

    const finalState = Object.assign({}, action, {payload: normal})

    next(finalState)
  }
}
