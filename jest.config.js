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
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/*.spec.ts'],
  collectCoverage: false,
  collectCoverageFrom: ['**/src/**/*.ts'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  coverageReporters: ['html', 'lcov', 'text-summary'],
  maxWorkers: 4,
  verbose: true,
  coverageThreshold: {
    global: {
      statements: 52,
      branches: 30,
      functions: 36,
      lines: 53,
    },
  },
};
