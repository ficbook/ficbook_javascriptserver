module.exports = {
  'extends': 'eslint:recommended',
  'parser': '@babel/eslint-parser',
  'parserOptions': {
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true,
      'jsx': true
    },
    'sourceType': 'module'
  },
  'plugins': [
    'standard',
    'promise'
  ],
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],

    'no-console':[
      'warn'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-trailing-spaces': [
      'error'
    ]
  }
};
