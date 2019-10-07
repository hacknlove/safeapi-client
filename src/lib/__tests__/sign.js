import { sign } from '../sign'
import { createKey } from '../createKey'
import fetchHelper from '@hacknlove/fetchhelper'

jest.mock('@hacknlove/fetchhelper')

fetchHelper.mockReturnValue(['uuid'])

describe('sign', () => {
  it('dows not throw', async () => {
    await createKey()
    const signed = await sign({})
    expect(signed).not.toBeUndefined()
  })
})
