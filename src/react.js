const { useState, useEffect } = require('react')
const { onGet, setResponse, refresh } = require('./onGet')
const {
  onUuidChange,
  publicKey
} = require('.')

function useGet (url, first = [], interval = 30) {
  const [value, set] = useState(first)
  useEffect(() => {
    const unsuscribe = onGet(url, (response) => {
      set(response)
    }, interval, first)

    return () => {
      unsuscribe()
    }
  }, [])

  return value
}

function useUUID () {
  const [value, set] = useState(publicKey.uuid)
  useEffect(() => onUuidChange(uuid => {
    set(uuid)
  }))
  return value
}

exports.useGet = useGet
exports.useUUID = useUUID
exports.setResponse = setResponse
exports.refresh = refresh
