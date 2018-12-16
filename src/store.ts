import produce from 'immer'

type Listener = (store: Store) => any

interface Res {
  isFetching?: boolean
  result?: any
  error?: Error
}

interface Store {
  [x: string]: Res
}

let store: Store = {}

const listeners: Listener[] = []

export function subscribe(listener: Listener) {
  listeners.push(listener)

  return function unsubscribe() {
    const index = listeners.indexOf(listener)
    listeners.splice(index, 1)
  }
}

export function getState() {
  return store
}

export function updateStore(id: string, fn: Function) {
  const preState = store[id] || {}

  const nextState = fn(preState)

  const nextStore = produce(store, draft => {
    draft[id] = nextState
  })

  store = nextStore

  // info all listeners
  listeners.forEach(fn => fn(nextStore))

  return nextStore
}
