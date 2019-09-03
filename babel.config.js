module.exports = function (api) {
  api.cache(true)

  const presets = [
    [
      '@babel/preset-env'
    ],
    [
      'babel-preset-power-assert'
    ]
  ]
  const plugins = []

  return {
    presets,
    plugins
  }
}
