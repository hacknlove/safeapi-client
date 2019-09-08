const { useState, useEffect } = require('react')
const isDifferent = require('isdifferent')
const {
  conf,
  fetch,
  hash,
  onUuidChange,
  options,
  publicKey
} = require('.')

const onFetchCallbacks = {}

function onGet (url, callback, interval) {
  var fetchHash = hash({
    method: options.method || 'GET',
    url,
    body: options.body || {}
  })

  onFetchCallbacks[fetchHash] = onFetchCallbacks[fetchHash] || {
    callbacks: {},
    intervals: {},
    response: undefined,
    last: 0
  }

  var sk
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
  } while (onFetchCallbacks[fetchHash].callbacks[sk])

  onFetchCallbacks[fetchHash].callbacks[sk] = callback
  onFetchCallbacks[fetchHash].internval[sk] = interval || conf.getInterval
}

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
module.exports.onGet = onGet
