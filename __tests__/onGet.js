import onGet from '../src/onGet'

jest.mock('../src')

beforeEach(() => {
  Object.keys(onGet.endpoints).forEach(k => {
    clearTimeout(onGet.endpoints[k].timeout)
    delete onGet.endpoints[k]
  })
})

describe('createEndpoint', () => {
  it('creates the endpoint if not exists', () => {
    onGet.createEndpoint('hola')
    assert.deepStrictEqual(onGet.endpoints, {
      hola: {
        url: 'hola',
        callbacks: {},
        intervals: {},
        min: Infinity,
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
        min: Infinity,
        response: undefined,
        last: 0
      }
    })
  })
})

describe('addNewSubscription', () => {
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
})
