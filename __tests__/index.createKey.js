const safeApi = require('../src')
const fetchHelper = require('@hacknlove/fetchhelper')

function ok () {
  return Promise.resolve({
    ok: true,
    json () {
      return 'uuid'
    }
  })
}
function netError () {
  return Promise.resolve({
    ok: false
  })
}

function apiError () {
  return Promise.resolve({
    ok: true,
    json () {
      return { error: true }
    }
  })
}

const fetch = jest.fn()

fetchHelper.fetch = fetch

describe('createKey', () => {
  afterEach(() => {
    safeApi.logout()
    fetch.mockImplementation(() => assert(!true, 'Should mock fetch before doing the test'))
  })

  it('creates a new key', async () => {
    fetch.mockImplementation(ok)

    await safeApi.createKey()
    assert(safeApi.publicKey.pem.match(/^-----BEGIN PUBLIC KEY-----/))
  })

  it('send the public key by POST', async () => {
    expect.assertions(1)

    fetch.mockImplementation((url, options) => {
      assert(options.method === 'POST')
      expect(true).toBe(true)
      return ok()
    })

    await safeApi.createKey()
  })
  it('if ok sets the credentials', async () => {
    assert(!safeApi.publicKey.uuid, 'Previous test not cleaned')
    fetch.mockImplementation(ok)

    await safeApi.createKey()

    assert(safeApi.publicKey.uuid)
  })
  it('if ok returns [res, undefined]', async () => {
    fetch.mockImplementation(ok)

    const [res, error] = await safeApi.createKey()

    assert(res === 'uuid')
    assert(error === undefined)
  })

  it('if server or network error not set credentials', async () => {
    fetch.mockImplementation(netError)

    await safeApi.createKey()

    assert(!safeApi.publicKey.uuid)
  })

  it('if server or network error returns [null, error]', async () => {
    fetch.mockImplementation(netError)

    const [res, error] = await safeApi.createKey()

    assert(res === null)
    assert.deepStrictEqual(error, { ok: false })
  })

  it('if apierror not set credentials', async () => {
    fetch.mockImplementation(apiError)

    await safeApi.createKey()

    assert(!safeApi.publicKey.uuid)
  })

  it('if api error returns [null, {error: ...}]', async () => {
    fetch.mockImplementation(apiError)

    const [res, error] = await safeApi.createKey()

    assert(res === null)
    assert.deepStrictEqual(error, { error: true })
  })
})
