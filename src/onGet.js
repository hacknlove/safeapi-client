const isDifferent = require('isdifferent')
const { conf, fetch } = require('.')

const endpoints = {}

/**
 * Inicializa los datos para gestional las peticiones GET a una url
 * @param {string} url url a la que se harań los GET
 * @returns {undefined}
 */
function createEndpoint (url) {
  if (!endpoints[url]) {
    endpoints[url] = {
      url,
      callbacks: {},
      intervals: {},
      minInterval: Infinity,
      last: 0
    }
  }
}

/**
 * Inicializa los datos para gestionar una nueva suscripción, y devuelve la función para desuscribirse
 * @param {string} url url a la que se harán los GET
 * @param {function} callback función que será ejecutada cada vez que cambie la respuesta al GET
 * @param {number} interval intervalo en segundos para volver a realizar el GET
 * @return {function} función para desuscribirse
 */
function addNewSuscription (url, callback, interval) {
  interval = Math.max(interval || conf.checkInterval, 1) * 1000

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
  createEndpoint(url)
  const unsuscribe = addNewSuscription(url, cb, interval)
  const endpoint = endpoints[url]
  endpoint.response = endpoint.response || first || []
  cb(endpoint.response)
  if (Date.now() - endpoint.last > 500) {
    refresh(url)
  }
  return unsuscribe
}

function setResponse (url, response, pospone) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return
  }

  endpoint.last = Date.now()

  if (pospone) {
    posponeGet(endpoint)
  }

  if (isDifferent(response, endpoint.response)) {
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
    return
  }
  posponeGet(endpoint)
  const response = await fetch(endpoint.url)
  setResponse(url, response, false)
}

function cached (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
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
