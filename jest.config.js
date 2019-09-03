module.exports = {
  clearMocks: true,
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/@hacknlove'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!@hacknlove).+\\.js$'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest.init.js'
  ]
}
