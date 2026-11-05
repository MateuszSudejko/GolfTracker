module.exports = {
  projects: [
    {
      displayName: 'logic',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: ['**/tests/domain/**/*.test.ts', '**/tests/db/**/*.test.ts', '**/tests/repo/**/*.test.ts'],
    },
    {
      displayName: 'ui',
      preset: 'jest-expo',
      testMatch: ['**/tests/ui/**/*.test.tsx'],
    },
  ],
};
