interface Options {
  id: string
  json?: any
  error?: Error
  selfHook?: Function
  globalHook?: Function
  updateRequest: (action: { id: string; payload: any }) => void
}

// fetch start
export const requestStart = (opts: Options) => {
  const { id, selfHook, globalHook, updateRequest } = opts

  const global_payload = globalHook ? globalHook(id) : {}
  const self_payload = selfHook ? selfHook(id) : {}

  const payload = {
    ...global_payload,
    ...self_payload
  }

  updateRequest({
    id,
    payload
  })
}

// fetch success
export const requestSuccess = (opts: Options) => {
  const { id, json, selfHook, globalHook, updateRequest } = opts

  const global_payload = globalHook ? globalHook(id, json) : {}
  const self_payload = selfHook ? selfHook(id, json) : {}

  const payload = {
    ...global_payload,
    ...self_payload
  }

  updateRequest({
    id,
    payload
  })
}

// fetch fail
export const requestFail = (opts: Options) => {
  const { id, error, selfHook, globalHook, updateRequest } = opts

  const global_payload = globalHook ? globalHook(id, error) : {}
  const self_payload = selfHook ? selfHook(id, error) : {}

  const payload = {
    ...global_payload,
    ...self_payload
  }

  updateRequest({
    id,
    payload
  })
}
