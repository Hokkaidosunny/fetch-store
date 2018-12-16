const { createApi } = require('../lib')

const api1 = createApi({ ifShowStatus: false })
const api2 = createApi()

const load1 = options =>
  api1.fetch('https://jsonplaceholder.typicode.com/todos/1')

const load2 = options =>
  api2.fetch('https://jsonplaceholder.typicode.com/todos/1')

module.exports = { load1, load2 }
