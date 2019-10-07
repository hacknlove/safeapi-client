import { sFetch } from './sFetch'

const plugin = {
  name: 'safeapi',
  regex: /^safeapi:\/\/./,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    return sFetch(endpoint.url)
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

export default plugin
