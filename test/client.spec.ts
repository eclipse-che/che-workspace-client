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

import { IRemoteAPI, RequestError } from '../src';
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
        expect(axios.request).toHaveBeenCalledWith({'baseURL': '/api', 'method': 'GET', 'url': '/workspace'});

    });

    it('should receive all user preferences', async () => {
        axios.request.mockImplementationOnce(() =>
        Promise.resolve({
            status: 200,
            data: {'key1': 'value', 'key2': 5}
        })
      );
        const preferences = await restApi.getUserPreferences();

        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({'baseURL': '/api', 'method': 'GET', 'url': '/preferences'});
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
        await restApi.start(workspaceId, undefined);

        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({
            'baseURL': '/api',
            "data": {},
            'method': 'POST',
            "params": {},
            'url': `/workspace/${workspaceId}/runtime`,
        });
    });

    it('should start the workspace in debug mode', async () => {
        const workspaceId = 'testWorkspaceId12345';
        axios.request.mockImplementationOnce(() => Promise.resolve({status: 200}));
        await restApi.start(workspaceId, {'debug-workspace-start': true});

        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({
            'baseURL': '/api',
            "data": {},
            'method': 'POST',
            "params": {"debug-workspace-start": true},
            'url': `/workspace/${workspaceId}/runtime`,
        });
    });

    it('should returns devfile schema', async () => {
        const devfileSchema = {
            'meta:license': ['dummy', 'license'],
            '$schema': 'http://json-schema.org/draft-07/schema#',
            'type': 'object',
            'title': 'Dummy devfile object',
            'description': 'This dummy test schema describes the structure of the devfile object',
        };
        axios.request.mockImplementationOnce(() => Promise.resolve({status: 200, data: devfileSchema}));
        const schema = await restApi.getDevfileSchema();

        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({
            'baseURL': '/api',
            'method': 'GET',
            'url': `/devfile`,
        });
        expect(schema).toBe(devfileSchema);
    });

    it('should returns kubernetes namespaces', async () => {
        const kubernetesNamespaces = [{name: 'che-che', attributes: {phase: 'Active', default: 'true'}}];
        axios.request.mockImplementationOnce(() => Promise.resolve({status: 200, data: kubernetesNamespaces}));
        const namespaces = await restApi.getKubernetesNamespace();

        expect(axios.request).toHaveBeenCalledTimes(1);
        expect(axios.request).toHaveBeenCalledWith({
            'baseURL': '/api',
            'method': 'GET',
            'url': `/kubernetes/namespace`,
        });
        expect(namespaces).toBe(kubernetesNamespaces);
    });

    it('should returns generic error message when status code is not found', async () => {
        const url = 'http://che.che';
        const axiosError = {
            config: {
                url: url
            },
            message: 'test',
            name: 'test',
            isAxiosError: true,
            toJSON: () => { return {}; }
        } as mockAxios.AxiosError;
        const requestError = new RequestError(axiosError);
        expect(requestError.message).toBe(`Failed to fetch the devfile due to network issues while requesting "${url}".`);
    });

    it('should return che server message when set', async () => {
        const url = 'http://che.che';
        const axiosError = {
            config: {
                url: url
            },
            response: {
                data: ['sample response']
            },
            message: 'test',
            name: 'test',
            code: '200',
            isAxiosError: true,
            toJSON: () => { return {}; }
        } as mockAxios.AxiosError;
        const requestError = new RequestError(axiosError);
        expect(requestError.message).toEqual(['sample response']);
    });

    it('should return general error message when error is from che server', async () => {
        const url = 'http://che.che';
        const code = '200';
        const axiosError = {
            config: {
                url: url
            },
            code: code,
            message: 'test',
            name: 'test',
            isAxiosError: true,
            toJSON: () => { return {}; }
        } as mockAxios.AxiosError;
        const requestError = new RequestError(axiosError);
        expect(requestError.message).toBe(`Failed to fetch the devfile due to "${code}" returned by "${url}. See browser logs for more details"`);
    });

});
