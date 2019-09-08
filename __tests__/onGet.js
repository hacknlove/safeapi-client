import onGet, { createTimeout } from '../src/onGet'

jest.mock('../')
import safeApi from '../'

describe('createEndpoint', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    Object.keys(onGet.endpoints).forEach(k => {
      clearTimeout(onGet.endpoints[k].timeout)
      delete onGet.endpoints[k]
    })
  })

  it('creates the endpoint if not exists', () => {
    onGet.createEndpoint('hola')
    assert.deepStrictEqual(onGet.endpoints, {
      hola: {
        url: 'hola',
        callbacks: {},
        intervals: {},
        minInterval: Infinity,
        response: undefined,
        last: 0
      }
    })
  })
  it('does nothing if the endpoings exists', () => {
    onGet.createEndpoint('hola')
    onGet.createEndpoint('hola')
    assert.deepStrictEqual(onGet.endpoints, {
      hola: {
        url: 'hola',
        callbacks: {},
        intervals: {},
        minInterval: Infinity,
        response: undefined,
        last: 0
      }
    })
  })
})

describe('addNewSubscription', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    Object.keys(onGet.endpoints).forEach(k => {
      clearTimeout(onGet.endpoints[k].timeout)
      delete onGet.endpoints[k]
    })
  })

  it('creates a new subscription', () => {
    onGet.addNewSuscription('hola')

    assert(Object.keys(onGet.endpoints.hola.callbacks).length === 1)
  })
  it('creates as many subscriptions as called', () => {
    onGet.addNewSuscription('hola')
    onGet.addNewSuscription('hola')
    onGet.addNewSuscription('hola')
    onGet.addNewSuscription('hola')

    assert(Object.keys(onGet.endpoints.hola.callbacks).length === 4)
  })
  it('set minInterval to the minimum', () => {
    onGet.addNewSuscription('hola', undefined, 50000)
    assert(onGet.endpoints.hola.minInterval === 50000)
    onGet.addNewSuscription('hola', undefined, 3000)
    assert(onGet.endpoints.hola.minInterval === 3000)
    onGet.addNewSuscription('hola', undefined, 80000)
    assert(onGet.endpoints.hola.minInterval === 3000)
    onGet.addNewSuscription('hola', undefined, 100)
    assert(onGet.endpoints.hola.minInterval === 500)

    assert(Object.keys(onGet.endpoints.hola.callbacks).length === 4)
  })
  it('returns a function', () => {
    const unsuscribe = onGet.addNewSuscription('hola')
    assert(typeof unsuscribe === 'function')
  })
  it('unsuscribe elimina la suscripcion', () => {
    onGet.addNewSuscription('hola')
    onGet.addNewSuscription('hola')
    onGet.addNewSuscription('hola')()
    onGet.addNewSuscription('hola')()
    assert(Object.keys(onGet.endpoints.hola.callbacks).length === 2)
  })
  it('tras eliminar todas las suscripciones elimina el endpoint', () => {
    ;[
      onGet.addNewSuscription('hola'),
      onGet.addNewSuscription('hola'),
      onGet.addNewSuscription('hola'),
      onGet.addNewSuscription('hola')].forEach(cb => cb())
    assert(onGet.endpoints.hola === undefined)
  })
})

describe('onGet', () => {
  var cb1 = jest.fn()
  var cb2 = jest.fn()
  beforeAll(() => {
    jest.useFakeTimers()
    Object.keys(onGet.endpoints).forEach(k => {
      clearTimeout(onGet.endpoints[k].timeout)
      delete onGet.endpoints[k]
    })
  })

  describe('first time', () => {
    onGet.onGet('hola', cb1, 60000)
    it('clears timeout undefined', () => {
      assert(clearTimeout.mock.calls[0][0] === undefined)
    })
  })
})
