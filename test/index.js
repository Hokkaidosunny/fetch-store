require('isomorphic-fetch')

const { subscribe } = require('../lib')
const { load1, load2 } = require('./load')

subscribe(store => {
  console.log(JSON.stringify(store, null, 2))
})

load1()

load2()
