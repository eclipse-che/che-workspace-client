/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
'use strict';

import {IRemoteAPI} from '../src/rest/remote-api';
import WorkspaceClient from '../src';
import * as mockAxios from 'axios';

const axios = (mockAxios as any);

describe('RestAPI >', () => {

    let restApi: IRemoteAPI;

    beforeEach(() => {
        restApi = WorkspaceClient.getRestApi();
        jest.resetAllMocks()
    });

    afterEach(() => {
    });

   it('dummy test', async () => {
        axios.request.mockImplementationOnce(() =>
        Promise.resolve({
            status: 200,
            data: 'Hello'
        })
      );
        await restApi.getAll();
        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({'baseURL': '/api', 'headers': {}, 'method': 'GET', 'url': '/workspace'});

    });

    it('should receive all user preferences', async () => {
        axios.request.mockImplementationOnce(() =>
        Promise.resolve({
            status: 200,
            data: {'key1':'value', 'key2': 5}
        })
      );
        const preferences = await restApi.getUserPreferences();

        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({'baseURL': '/api', 'headers':{}, 'method': 'GET', 'url': '/preferences'});
        expect(preferences).toBeDefined();
        expect(preferences).toHaveProperty('key1');
        expect(preferences).toHaveProperty('key2');
        expect(preferences).not.toHaveProperty('key3');
        expect(preferences['key1']).toBe('value');
        expect(preferences['key2']).toBe(5);
    });

    it('should start the workspace', async () => {
        const workspaceId = 'testWorkspaceId12345';
        axios.request.mockImplementationOnce(() => Promise.resolve({status: 200}));
        await restApi.start(workspaceId);
        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({
            'baseURL': '/api',
            "data": {},
            'headers': {},
            'method': 'POST',
            'url': `/workspace/${workspaceId}/runtime`
        });
    });
});
