/*
 * Copyright (c) 2018-2021 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: [
    '.github/',
    '.vscode/',
    'assets/',
    'coverage/',
    'dist/',
    '*.js',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'notice',
    'prettier',
  ],
  rules: {
    'notice/notice': [
      'error',
      {
        templateFile: './.config/copyright.js',
        onNonMatchingHeader: 'report',
        messages: {
          reportAndSkip: 'Missing license header',
        },
      },
    ],
    'prettier/prettier': 'error',
    'no-tabs': 'error',
    'linebreak-style': [
      'error',
      'unix'
    ],
    semi: [
      'error',
      'always'
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        'max': 1,
        'maxEOF': 1,
      }
    ],
    'notice/notice': [
      'error',
      {
        templateFile: '.config/copyright.js',
        onNonMatchingHeader: 'report',
        messages: {
          reportAndSkip: 'Missing license header',
        },
      },
    ],
    'spaced-comment': 'error',
    'no-warning-comments': [
      'warn',
      {
        'terms': ['todo'],
        'location': 'start'
      }
    ],
    // disabled to avoid conflicts with prettier
    quotes: 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
