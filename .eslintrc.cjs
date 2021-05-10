module.exports = {
    env: {
        node: true,
        es2021: true,
        mocha: true
    },
    extends: [
        'eslint:recommended',
        'plugin:mocha/recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        semi: 'error',
        quotes: ['error', 'single', { 'allowTemplateLiterals': true }]
    }
};
