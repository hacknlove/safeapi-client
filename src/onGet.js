const isDifferent = require('isdifferent')
const { conf, fetch } = require('.')

const endpoints = {}

function createEndpoint (url) {
  if (!endpoints[url]) {
    endpoints[url] = {
      url,
      callbacks: {},
      intervals: {},
      minInterval: Infinity,
      response: undefined
    }
  }
}

function addNewSuscription (url, callback, interval) {
  createEndpoint(url)

  interval = Math.max(interval || conf.checkInterval, 500)

  const endpoint = endpoints[url]
  var sk
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
  } while (endpoint.callbacks[sk])

  endpoint.callbacks[sk] = callback
  endpoint.intervals[sk] = interval
  endpoint.minInterval = Math.min(endpoint.minInterval, ...Object.values(endpoint.intervals))

  const unsuscribe = () => {
    if (!endpoint.callbacks.hasOwnProperty(sk)) {
      return console.warn('You have yet unsuscribed.')
    }
    delete endpoint.callbacks[sk]
    delete endpoint.intervals[sk]
    endpoint.minInterval = Math.min(endpoint.minInterval, ...Object.values(endpoint.intervals))

    if (Object.keys(endpoint.callbacks).length === 0) {
      clearTimeout(endpoint.timeout)
      delete endpoints[url]
    }
  }

  return unsuscribe
}

function onGet (url, cb, interval, first) {
  const unsuscribe = addNewSuscription(url, cb, interval)
  const endpoint = endpoints[url]
  endpoint.response = endpoint.response || first || []
  cb(endpoint.response)
  refresh(url)
  return unsuscribe
}

function setResponse (url, response, pospone) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return console.warn('¿Eliminado?', url)
  }

  if (pospone) {
    posponeGet(endpoint)
  }

  if (isDifferent(response, endpoint.response)) {
    console.log('esDiferente')
    endpoint.response = response
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.response))
  }
}

function posponeGet (endpoint) {
  clearTimeout(endpoint.timeout)
  if (!endpoints[endpoint.url]) {
    return
  }
  endpoint.timeout = setTimeout(() => {
    refresh(endpoint.url)
  }, Math.max(endpoint.minInterval))
}

async function refresh (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return console.warn('¿Eliminado?', url)
  }
  posponeGet(endpoint)
  const response = await fetch(endpoint.url)
  setResponse(url, response, false)
}

function cached (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    console.warn('¿Eliminado?', url)
    console.log(endpoints)
    return []
  }
  return endpoints[url].response
}

exports.onGet = onGet
exports.setResponse = setResponse
exports.refresh = refresh
exports.cached = cached

if (process.env.NODE_ENV === 'test') {
  exports.endpoints = endpoints
  exports.createEndpoint = createEndpoint
  exports.addNewSuscription = addNewSuscription
  exports.posponeGet = posponeGet
}
