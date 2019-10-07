import { sFetch } from '../sFetch'
import fetchHelper from '@hacknlove/fetchhelper'
import { sign } from '../sign'

jest.mock('../sign')
jest.mock('@hacknlove/fetchhelper')
jest.mock('onget')

describe('fetch', () => {
  it('makes a fetch to the url', async () => {
    fetchHelper.mockReturnValue([])
    await sFetch('url')
    expect(fetchHelper.mock.calls[0][0][0]).toBe('url')
  })

  it('do gets if no options', async () => {
    await sFetch()
    expect(fetchHelper.mock.calls[0][0][1].method).toBe('GET')
  })

  it('do not add a body to GET', async () => {
    await sFetch()
    expect(fetchHelper.mock.calls[0][0][1].body).toBeUndefined()
  })

  it('ads the Authorization header', async () => {
    sign.mockReturnValue('signed')
    await sFetch()
    expect(fetchHelper.mock.calls[0][0][1].headers.Authorization).not.toBeUndefined()
  })
})
