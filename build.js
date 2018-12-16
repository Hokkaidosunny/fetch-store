const { buildCommonjs } = require('build-my-package')

buildCommonjs({
  entry: './src',
  language: 'typescript'
})
