import 'isomorphic-fetch'
import { createRequestStore } from '../lib'

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
