export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: { file: 'dist/safeapiclient.cjs.js', format: 'cjs', indent: false }
  },

  // ES
  {
    input: 'src/index.js',
    output: { file: 'dist/safeapiclient.es.js', format: 'es', indent: false }
  }
]
