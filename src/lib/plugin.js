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
  refresh (endpoint, eventHandler) {
    return sFetch(endpoint.realurl)
      .then(response => {
        response.json()
          .then(eventHandler)
          .catch(() => {
            response.text()
              .then(eventHandler)
              .catch(eventHandler)
          })
      })
      .catch(eventHandler)
  }
}
