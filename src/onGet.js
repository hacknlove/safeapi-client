const isDifferent = require('isdifferent')
const {
  conf,
  fetch
} = require('.')

const endpoints = {}

function createEndpoint (url) {
  if (!endpoints[url]) {
    endpoints[url] = {
      url,
      callbacks: {},
      intervals: {},
      min: Infinity,
      response: undefined,
      last: 0
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
  endpoint.minInterval = Math.min(endpoint.min, ...Object.values(endpoint.intervals))

  const unsuscribe = () => {
    if (endpoint.callbacks[sk] === undefined) {
      return console.warn('You have yet unsuscribed.')
    }
    delete endpoint.callbacks[sk]
    delete endpoint.interval[sk]
    if (Object.keys(endpoint.callbacks).length === 0) {
      clearTimeout(endpoint.timeout)
      delete endpoints[url]
    }
  }

  return unsuscribe
}

function onGet (url, cb, interval) {
  const now = Date.now()
  const unsuscribe = addNewSuscription(url, cb, interval)
  const endpoint = endpoints[url]

  if (now - endpoint.last < 250) {
    cb(endpoint.response)
  }
  if (!endpoint.timeout) {
    endpoint.timeout = createTimeout(endpoint)
  }
  return unsuscribe
}

function setResponse (url, res, pospone, err) {
  const endpoint = endpoints[url]

  Object.values(endpoint.callbacks).forEach(cb => {
    cb(res, err)
  })
  if (pospone) {
    posponeGet()
  }
}

function posponeGet (endpoint) {
  clearTimeout(endpoint.timeout)
  endpoint.timeout = createTimeout(endpoint)
}

async function refresh (url) {
  const endpoint = endpoints[url]

  const response = await fetch(endpoint.url)

  if (!isDifferent(response, endpoint.response)) {

  }
}

function createTimeout (endpoint) {
  clearTimeout(endpoint.timeout)
  endpoint.timeout = setTimeout(() => {
    refresh(endpoint.url)
  }, endpoint.minInterval)
}

exports.onGet = onGet
exports.setResponse = setResponse
exports.refresh = refresh

if (process.env.NODE_ENV === 'test') {
  exports.endpoints = endpoints
  exports.createEndpoint = createEndpoint
  exports.addNewSuscription = addNewSuscription
  exports.posponeGet = posponeGet
  exports.createTimeout = createTimeout
}
