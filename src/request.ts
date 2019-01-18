import createStore, { Store } from './store'

/**
 * types
 */
export interface ActionOptions {
  id: string
  payload: {
    [x: string]: any;
  }
}

export interface RequestOptions {
  id: string
  url: string
  options?: any
  bailout?: (store: Store) => boolean
  onRequestStart?: (id: string) => any
  onRequestSuccess?: (id: string, json: any) => any
  onRequestFail?: (id: string, e: Error) => any
}

export interface CreateRequestStoreOptions {
  initStore?: Store
  onRequestStart?: (id: string) => any
  onRequestSuccess?: (id: string, json: any) => any
  onRequestFail?: (id: string, e: Error) => any
}

function createRequestStore(opts?: CreateRequestStoreOptions) {
  const {
    initStore,
    onRequestStart: global_onRequestStart,
    onRequestSuccess: global_onRequestSuccess,
    onRequestFail: global_onRequestFail
  } = opts || ({} as CreateRequestStoreOptions)

  const { subscribe, updateStore, getStore } = createStore(initStore)

  /**
   * update request status to store
   */
  function updateRequestStatus(opts: ActionOptions) {
    const { id, payload } = opts

    const curStore = getStore()
    const curPayload = curStore[id] || {}

    curStore[id] = {
      ...curPayload,
      ...payload
    }

    const nextStore = { ...curStore }

    updateStore(nextStore)
  }

  // fetch start
  const requestStart = (
    id: string,
    onRequestStart?: Function,
    global_onRequestStart?: Function
  ) => {
    let global_payload = {}
    let self_payload = {}

    if (global_onRequestStart) {
      global_payload = global_onRequestStart(id)
    }

    if (onRequestStart) {
      self_payload = onRequestStart(id)
    }

    const payload = {
      ...global_payload,
      ...self_payload
    }

    updateRequestStatus({
      id,
      payload
    })
  }

  // fetch success
  const requestSuccess = (
    id: string,
    json: object,
    onRequestSuccess?: Function,
    global_onRequestSuccess?: Function
  ) => {
    let global_payload = {}
    let self_payload = {}

    if (global_onRequestSuccess) {
      global_payload = global_onRequestSuccess(id, json)
    }

    if (onRequestSuccess) {
      self_payload = onRequestSuccess(id, json)
    }

    const payload = {
      ...global_payload,
      ...self_payload
    }

    updateRequestStatus({
      id,
      payload
    })
  }

  // fetch fail
  const requestFail = (
    id: string,
    error: Error,
    onRequestFail?: Function,
    global_onRequestFail?: Function
  ) => {
    let global_payload = {}
    let self_payload = {}

    if (global_onRequestFail) {
      global_payload = global_onRequestFail(id, error)
    }

    if (onRequestFail) {
      self_payload = onRequestFail(id, error)
    }

    const payload = {
      ...global_payload,
      ...self_payload
    }

    updateRequestStatus({
      id,
      payload
    })
  }

  /**
   * requset function
   * @param opts
   */
  async function request(opts: RequestOptions) {
    const {
      id,
      url,
      options,
      bailout,
      onRequestStart,
      onRequestSuccess,
      onRequestFail
    } = opts

    // cancel the request
    if (bailout && bailout(getStore())) {
      return
    }

    requestStart(id, onRequestStart, global_onRequestStart)

    try {
      const res = await fetch(url, options)
      const json = await res.json()

      requestSuccess(id, json, onRequestSuccess, global_onRequestSuccess)

      return json
    } catch (e) {
      requestFail(id, e, onRequestFail, global_onRequestFail)

      return Promise.reject(e)
    }
  }

  return {
    getStore,
    subscribe,
    request
  }
}

export { createRequestStore }
