require('isomorphic-fetch')
const { createRequestStore } = require('../lib')

const { subscribe, request, getStore } = createRequestStore({
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

const loadTodos = () => {
  return request({
    id: 'TODOS',
    url: 'https://jsonplaceholder.typicode.com/todos/1'
  })
}

describe('request-store', () => {
  let listenedStore = {}

  subscribe(store => {
    listenedStore = store
  })

  test('request', () => {
    return loadTodos().then(json => {
      expect(json).toEqual({
        userId: 1,
        id: 1,
        title: 'delectus aut autem',
        completed: false
      })
    })
  })

  test('getStore', () => {
    const store = getStore()

    expect(store).toEqual(listenedStore)
  })
})
