// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'ts', 'json'],

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/?(*.)+(spec|test).ts?(x)',
    // '**/e2e/routes/?(*.)+(spec|test).ts?(x)',
    // '**/integration/?(*.)+(spec|test).ts?(x)',
    // '**/unit/**/?(*.)+(spec|test).ts?(x)',
    // '**/integration/NoteService.+(spec|test).ts?(x)',
    // '**/e2e/routes/notes.+(spec|test).ts?(x)',
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
