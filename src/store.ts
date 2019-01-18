export interface Store {
  [x: string]: any
}

type Listener = (s: Store) => void

function createStore(initState?: Store) {
  let store: Store = initState || {}

  const listeners: Listener[] = []

  function updateStore(nextStore: Store) {
    if (nextStore == store) {
      return
    }

    store = nextStore

    listeners.forEach(listener => listener(store))
  }

  function getStore() {
    return store
  }

  function subscribe(listener: Listener) {
    listeners.push(listener)

    return function unsubscribe() {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  return {
    updateStore,
    getStore,
    subscribe
  }
}

export default createStore
