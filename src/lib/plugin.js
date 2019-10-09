import { sFetch } from './sFetch'

const PROTOCOL_LENGTH = 'safeapi://'.length

export const plugin = {
  name: 'safeapi',
  regex: /^safeapi:\/\/./,
  checkInterval: 30000,
  threshold: 500,
  getEndpoint (endpoint) {
    endpoint.realurl = endpoint.url.substr(PROTOCOL_LENGTH)
  },
  async refresh (endpoint, eventHandler) {
    eventHandler(await sFetch(endpoint.realurl))
  }
}
