import { createID } from './util/uniqId'
import { updateStore, getState } from './store'
import _ from 'lodash'

interface GlobalHandlers {
  errorHandler?: (e: Error) => any
}

/**
 * global config, would be hooked in Api class
 */
let globalHandlers: GlobalHandlers = {}

/**
 * set global config
 * @param handlers
 */
export function setGlobalHandlers(handlers: GlobalHandlers) {
  globalHandlers = {
    ...globalHandlers,
    ...handlers
  }
}

interface FetchOptions extends RequestInit {
  bailout?: Function
}

/**
 * constructor param
 */
interface Param {
  id?: string
  ifShowStatus?: boolean
  errorHandler?: (e: Error) => any
  bailout?: Function
}

export class Api {
  id: string

  ifShowStatus: boolean

  errorHandler?: (e: Error) => any

  constructor(param: Param = {}) {
    this.id = param.id || createID()

    // if need 'isFetching' property
    this.ifShowStatus = _.isBoolean(param.ifShowStatus)
      ? param.ifShowStatus
      : true

    // if need handle error
    this.errorHandler = param.errorHandler || globalHandlers.errorHandler
  }

  fetch = async (url: string, options: FetchOptions = { method: 'GET' }) => {
    const { bailout } = options

    // if cancel fetch
    if (_.isFunction(bailout) && bailout(getState())) {
      return
    }

    // fetch start
    fetchStart(this)

    try {
      const res = await fetch(url, options)
      const json = await res.json()

      fetchSuccess({
        ...this,
        json
      })

      return Promise.resolve(json)
    } catch (e) {
      fetchFail({
        ...this,
        error: e
      })

      // handler error
      if (this.errorHandler) {
        this.errorHandler(e)
      }

      return Promise.reject(e)
    }
  }
}

/**
 * create api instance
 * @param param
 */
export function createApi(param?: Param) {
  const api = new Api(param)
  return api
}

/**
 * lifecycle start
 * @param ctx
 */
function fetchStart(ctx: any) {
  const { id, ifShowStatus } = ctx

  updateStore(id, (state: any) => {
    // a new fetch action start, remove the pre error
    const nextState = _.omit(state || {}, ['error'])

    if (ifShowStatus) {
      nextState.isFetching = true
    }

    return nextState
  })
}

/**
 * lifecycle success
 * @param ctx
 */
function fetchSuccess(ctx: any) {
  const { id, json, ifShowStatus } = ctx

  updateStore(id, (state: any) => {
    const nextState = {
      ...state,
      result: json
    }

    if (ifShowStatus) {
      nextState.isFetching = false
    }

    return nextState
  })
}

/**
 * lifecycle fail
 * @param ctx
 */
function fetchFail(ctx: any) {
  const { id, ifShowStatus, error } = ctx

  // fetch fail
  updateStore(id, (state: any) => {
    const nextState = {
      ...state,
      error
    }

    if (ifShowStatus) {
      nextState.isFetching = false
    }

    return nextState
  })
}
