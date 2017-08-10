module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb'],
  globals: {
    __DEV__: true,
  },
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'arrow-parens': 0,
    'import/prefer-default-export': 0,
    'react/forbid-prop-types': 0,
    'jsx-a11y/label-has-for': 0,
    'react/no-danger': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'jsx-a11y/href-no-hash': 0,
  },
  settings: {
    'import/core-modules': [
      'makeen',
      'makeen-cli',
      'makeen-config',
      'makeen-file-storage',
      'makeen-graphql',
      'makeen-mailer',
      'makeen-router',
      'makeen-mongodb',
      'makeen-user',
      'makeen-security',
    ],
  },
};
