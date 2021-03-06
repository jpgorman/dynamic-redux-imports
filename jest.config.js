module.exports = {
  setupTestFrameworkScriptFile: './test/setup.js',
  setupFiles: ['<rootDir>/test/setup.js'],
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testMatch: ['**/__tests__/*.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
