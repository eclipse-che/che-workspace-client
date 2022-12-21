/*********************************************************************
 * Copyright (c) 2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

const mockAxios = jest.genMockFromModule('axios')

// this is the key to fix the axios.create() undefined error!
mockAxios.create = jest.fn(() => mockAxios)
mockAxios.get = jest.fn(() => Promise.resolve({ data: {} }))
mockAxios.request = jest.fn(() => Promise.resolve({ data: {} }))

module.exports = mockAxios
