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

import { IRemoteAPI, RequestError } from '../src';
import WorkspaceClient from '../src';
import * as mockAxios from 'axios';

const axios = mockAxios as any;

describe('RestAPI >', () => {
  let restApi: IRemoteAPI;

  beforeEach(() => {
    restApi = WorkspaceClient.getRestApi();
    jest.resetAllMocks();
  });

  afterEach(() => {
    // no-op
  });

  it('dummy test', async () => {
    axios.request.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'Hello',
      }),
    );
    await restApi.getAll();
    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: '/api',
      method: 'GET',
      url: '/workspace',
    });
  });

  it('should receive all user preferences', async () => {
    axios.request.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: { key1: 'value', key2: 5 },
      }),
    );
    const preferences = await restApi.getUserPreferences();

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: '/api',
      method: 'GET',
      url: '/preferences',
    });
    expect(preferences).toBeDefined();
    expect(preferences).toHaveProperty('key1');
    expect(preferences).toHaveProperty('key2');
    expect(preferences).not.toHaveProperty('key3');
    expect(preferences.key1).toBe('value');
    expect(preferences.key2).toBe(5);
  });

  it('should returns list of kubernetes namespace', async () => {
    const kubernetesNamespaces = [
      { name: 'che-che', attributes: { phase: 'Active', default: 'true' } },
    ];
    axios.request.mockImplementationOnce(() =>
      Promise.resolve({ status: 200, data: kubernetesNamespaces }),
    );
    const namespaces = await restApi.getKubernetesNamespace();

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: '/api',
      method: 'GET',
      url: `/kubernetes/namespace`,
    });
    expect(namespaces).toBe(kubernetesNamespaces);
  });

  it('should returns kubernetes namespace', async () => {
    const kubernetesNamespace = {
      name: 'che-che',
      attributes: { phase: 'Active', default: 'true' },
    };
    axios.request.mockImplementationOnce(() =>
      Promise.resolve({ status: 200, data: kubernetesNamespace }),
    );
    const namespace = await restApi.provisionKubernetesNamespace();

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: '/api',
      method: 'POST',
      url: `/kubernetes/namespace/provision`,
    });
    expect(namespace).toBe(kubernetesNamespace);
  });

  it('should returns generic error message when status code is not found', async () => {
    const url = 'http://che.che';
    const axiosError = {
      config: {
        url: url,
      },
      message: 'test',
      name: 'test',
      isAxiosError: true,
      toJSON: () => {
        return {};
      },
    } as mockAxios.AxiosError;
    const requestError = new RequestError(axiosError);
    expect(requestError.message).toBe(`network issues occured while requesting "${url}".`);
  });

  it('should return che server message when set', async () => {
    const url = 'http://che.che';
    const axiosError = {
      config: {
        url: url,
      },
      response: {
        data: {
          message: 'sample response',
        },
      },
      message: 'test',
      name: 'test',
      code: '200',
      isAxiosError: true,
      toJSON: () => {
        return {};
      },
    } as mockAxios.AxiosError;
    const requestError = new RequestError(axiosError);
    expect(requestError.message).toEqual('sample response');
  });

  it('should return general error message when error is from che server', async () => {
    const url = 'http://che.che';
    const code = '200';
    const axiosError = {
      config: {
        url: url,
      },
      code: code,
      message: 'test',
      name: 'test',
      isAxiosError: true,
      toJSON: () => {
        return {};
      },
    } as mockAxios.AxiosError;
    const requestError = new RequestError(axiosError);
    expect(requestError.message).toBe(`"${code}" returned by "${url}"."`);
  });

  it('should returns current user profile', async () => {
    const userProfile = {
      attributes: {
        firstName: 'John',
        lastName: 'Doe',
        preferred_username: 'Johnny',
      },
      email: 'johndoe@test.com',
      userId: 'john-doe-id',
    };
    axios.request.mockImplementationOnce(() => Promise.resolve({ status: 200, data: userProfile }));
    const schema = await restApi.getCurrentUserProfile();

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: '/api',
      method: 'GET',
      url: '/profile',
    });
    expect(schema).toBe(userProfile);
  });

  it('should returns a factory resolver', async () => {
    const url = 'http://test-location';
    const overrideParams = {
      'override.metadata.generateName': 'testPrefix',
    };
    axios.request.mockImplementationOnce(() => Promise.resolve({ status: 200, data: {} }));
    await restApi.getFactoryResolver(url, overrideParams);

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: '/api',
      method: 'POST',
      url: '/factory/resolver/',
      data: Object.assign(overrideParams, { url }),
    });
  });

  it('should call refresh factory token', async () => {
    axios.request.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
    await restApi.refreshFactoryOauthToken('http://test-location');

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: '/api',
      method: 'POST',
      url: '/factory/token/refresh?url=http://test-location',
    });
  });

  it('should call refresh factory token', async () => {
    axios.request.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
    await restApi.deleteOAuthToken('test_token_hgjhkvkjjhmbm');

    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: '/api',
      method: 'DELETE',
      url: '/oauth/token?oauth_provider=test_token_hgjhkvkjjhmbm',
    });
  });
});
