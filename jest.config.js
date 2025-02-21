
module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: "coverage",
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ['<rootDir>/jest.setup.js'],
  verbose: true
};

