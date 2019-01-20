import createStore, { Store } from './store'
import { requestStart, requestSuccess, requestFail } from './lifecycle'

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
  function updateRequest(opts: ActionOptions) {
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

    requestStart({
      id,
      selfHook: onRequestStart,
      globalHook: global_onRequestStart,
      updateRequest
    })

    try {
      const res = await fetch(url, options)
      const json = await res.json()

      requestSuccess({
        id,
        json,
        selfHook: onRequestSuccess,
        globalHook: global_onRequestSuccess,
        updateRequest
      })

      return json
    } catch (e) {
      requestFail({
        id,
        error: e,
        selfHook: onRequestFail,
        globalHook: global_onRequestFail,
        updateRequest
      })

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
