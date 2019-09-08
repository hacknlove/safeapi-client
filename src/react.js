const { useState, useEffect } = require('react')
const isDifferent = require('isdifferent')
const {
  fetch,
  onUuidChange,
  publicKey
} = require('.')

function useFetch (url, options, first, interval = 3000) {
  async function refresh () {
    const response = await fetch(url, options)
    if (cancelled) {
      return
    }
    if (isDifferent(value, response)) {
      return set(response)
    }
  }

  const [value, set] = useState(() => {
    refresh()
    return [first]
  })
  var cancelled = false

  useEffect(() => () => {
    cancelled = true
  }, [])

  useEffect(() => {
    var i = setInterval(() => {
      refresh()
    }, interval)
    return () => clearInterval(i)
  }, [value])

  return [value[0], refresh, value[1]]
}

function useUUID () {
  const [value, set] = useState(publicKey.uuid)
  useEffect(() => onUuidChange(uuid => {
    set(uuid)
  }))
  return value
}

module.exports.useFetch = useFetch
module.exports.useUUID = useUUID
