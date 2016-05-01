import test from 'ava'
import normalizeMiddleware from './index'
import {normalize, Schema} from 'normalizr'
import {applyMiddleware, createStore} from 'redux'

test('normalizer must return a function to handle next', (t) => {
  const doDispatch = () => {}
  const doGetState = () => {}
  const nextHandler = normalizeMiddleware({dispatch: doDispatch, getState: doGetState})
  t.is(typeof nextHandler, 'function')
  t.is(nextHandler.length, 1)
})

test('normalizer must return a function to handle action', (t) => {
  const doDispatch = () => {}
  const doGetState = () => {}
  const nextHandler = normalizeMiddleware({dispatch: doDispatch, getState: doGetState})
  const actionHandler = nextHandler()

  t.is(typeof actionHandler, 'function')
  t.is(actionHandler.length, 1)
})

test('normalizer must return a normalized results', (t) => {
  const userSchema = new Schema('users')
  const user = {
    id: 123,
    name: 'user name',
    avatar: 'http://somewhere.i.belong.com'
  }

  const expectedResult = normalize(user, userSchema)

  const actionWithSchema = {
    type: 'SCHEMA',
    payload: user,
    meta: {
      schema: userSchema
    }
  }

  const reducer = (state = {}, action) => {
    if (action.type === 'SCHEMA') {
      t.deepEqual(action.payload, expectedResult)
    }
  }

  const configureStore = applyMiddleware(normalizeMiddleware)(createStore)
  const store = configureStore(reducer)
  store.dispatch(actionWithSchema)
})

test('normalizer must return next action if no schema', (t) => {
  const user = {id: 123, name: 'user name'}
  const action = {
    type: 'NOSCHEMA',
    payload: user,
    meta: {}
  }

  const reducer = (state = {}, action) => {
    if (action.type === 'NOSCHEMA') {
      t.deepEqual(action.payload, user)
    }
  }

  const configureStore = applyMiddleware(normalizeMiddleware)(createStore)
  const store = configureStore(reducer)
  store.dispatch(action)
})

test('normalizer must return next action if no meta', (t) => {
  const user = {id: 123, name: 'user name'}

  const reducer = (state = {}, action) => {
    if (action.type === 'NOSCHEMA') {
      t.deepEqual(action.payload, user)
    }
  }

  const configureStore = applyMiddleware(normalizeMiddleware)(createStore)
  const store = configureStore(reducer)

  const actionWithoutMeta = {
    type: 'NOSCHEMA',
    payload: user
  }

  store.dispatch(actionWithoutMeta)
})

test('normalizer must return next action if payload not exist', (t) => {
  const userSchema = new Schema('users')
  const action = {
    type: 'NOSCHEMA',
    meta: {
      schema: userSchema
    }
  }

  const reducer = (state = {}, action) => {
    if (action.type === 'NOSCHEMA') {
      t.deepEqual(action.type, 'NOSCHEMA')
      t.deepEqual(action.meta.schema, userSchema)
    }
  }

  const configureStore = applyMiddleware(normalizeMiddleware)(createStore)
  const store = configureStore(reducer)
  store.dispatch(action)
})

test('normalizer must return next action if action contain error', (t) => {
  const userSchema = new Schema('users')
  const action = {
    type: 'ERROR',
    error: true,
    payload: {
      error: 'error message'
    },
    meta: {
      schema: userSchema
    }
  }

  const reducer = (state = {}, action) => {
    if (action.type === 'ERROR') {
      t.deepEqual(action.type, 'ERROR')
      t.deepEqual(action.error, true)
      t.deepEqual(action.payload, {error: 'error message'})
      t.deepEqual(action.meta.schema, userSchema)
    }
  }

  const configureStore = applyMiddleware(normalizeMiddleware)(createStore)
  const store = configureStore(reducer)
  store.dispatch(action)
})
