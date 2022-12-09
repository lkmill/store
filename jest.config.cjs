'use strict'

module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'mjs'],
  extensionsToTreatAsEsm: ['.jsx'],
  transform: {},
}
