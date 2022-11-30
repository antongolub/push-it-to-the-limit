module.exports = {
    extends: [
        'eslint-config-qiwi',
    ],
    rules: {
        'unicorn/prefer-spread': 'off',
        'unicorn/catch-error-name': 'off',
        'unicorn/no-array-for-each': 'off',
        'unicorn/no-array-callback-reference': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'unicorn/no-abusive-eslint-disable': 'off',
    }
};
