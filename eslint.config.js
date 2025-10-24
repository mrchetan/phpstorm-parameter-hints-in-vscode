const chaiFriendly = require('eslint-plugin-chai-friendly');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
        Buffer: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    plugins: {
      'chai-friendly': chaiFriendly
    },
    rules: {
      ...chaiFriendly.configs.recommended.rules,
      'no-const-assign': 'warn',
      'no-this-before-super': 'warn',
      'no-undef': 'error',
      'no-unreachable': 'warn',
      'no-unused-vars': 'warn',
      'constructor-super': 'warn',
      'valid-typeof': 'warn',
      'no-await-in-loop': 'off',
      'no-restricted-syntax': 'off'
    }
  }
];
