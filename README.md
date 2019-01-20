# Request-store

[![Build Status](https://travis-ci.org/Hokkaidosunny/request-store.svg?branch=master)](https://travis-ci.org/Hokkaidosunny/request-store)

Record request status and cache all responses into memory

# Why

Why we should record all request status and cache all responses into memory

1. use all request status to control a gloabl Loading component
2. handle error or success info in global
3. combine several response for further usage

With Redux, it's easy to achieve that, but we need to write a lot of boilerplater,
request-store aim to solve this problem.

# Usage

## basic usage

```javascript
import { createRequestStore } from 'request-store'

const { subscribe, request } = createRequestStore({
  onRequestStart: () => ({
    isFetching: true
  }),
  onRequestSuccess: (_id, json) => ({
    isFetching: false,
    reslut: json,
    error: null
  }),
  onRequestFail: (_id, error) => ({
    isFetching: false,
    error
  })
})

subscribe(store => {
  console.log(JSON.stringify(store, null, 2))
})

const loadTodos = () => {
  return request({
    id: 'TODOS',
    url: 'https://jsonplaceholder.typicode.com/todos/1'
  })
}

loadTodos().then(res => {
  console.log(res)
})

/** request-store
// fetch start
{
  "TODOS": {
    "isFetching": true
  }
}

// fetch success
{
  "TODOS": {
    "isFetching": false,
    "reslut": {
      "userId": 1,
      "id": 1,
      "title": "delectus aut autem",
      "completed": false
    },
    "error": null
  }
}
*/
```

## integrate with redux

```javascript
import { createStore, combineReducers } from 'redux'
import { createRequestStore } from 'request-store'

const rootReducer = combineReducers({
  requestStore: (state, action) => {
    if (action.type === 'UPDATE_REQUEST_STORE') {
      return action.payload
    } else {
      return state
    }
  }
})

const store = createStore(rootReducer, {})

const { request, subscribe } = createRequestStore({
  //...
})

subscribe(requestStore => {
  store.dispatch({
    type: 'UPDATE_REQUEST_STORE',
    payload: requestStore
  })
})

/** redux-store
{
  'requestStore': {
    "TODOS": {
      "isFetching": false,
      "reslut": {
        "userId": 1,
        "id": 1,
        "title": "delectus aut autem",
        "completed": false
      },
      "error": null
    }
  }
}
*/
```

# Api

## createRequestStore(opts?: CreateRequestStoreOptions)

```javascript
interface CreateRequestStoreOptions {
  initStore?: Store
  onRequestStart?: (id: string) => any
  onRequestSuccess?: (id: string, json: any) => any
  onRequestFail?: (id: string, e: Error) => any
}
```

- initStore: init store
- onRequestStart: Global request start handler, will be called on every request start
- onRequestSuccess: Global request success handler, will be called on every request success
- onRequestFail: Global request fail handler, will be called on every request fail
- all lifecycle method return value will be merge into request store

## request(opts: RequestOptions)

```javascript
interface RequestOptions {
  id: string
  url: string
  options?: any
  bailout?: (store: Store) => boolean
  onRequestStart?: (id: string) => any
  onRequestSuccess?: (id: string, json: any) => any
  onRequestFail?: (id: string, e: Error) => any
}
```

- id: uniq string
- url: url
- options: fetch options
- bailout: if cancel this request
- onRequestStart: this request start handler, will be called this request start
- onRequestSuccess: this request success handler, will be called this request success
- onRequestFail: this request fail handler, will be called this request fail
- self lifecycle handler return value can overwrite the global lifecycle handler return value

## subscribe(listener)

```javascript
type Listener = (s: Store) => void
```
