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

import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios';
import { che } from '@eclipse-che/api';

export interface FactoryResolver {
  v: string;
  source: string;
  devfile: che.workspace.devfile.Devfile;
  scm_info: {
    clone_url: string;
    scm_provider: string;
    branch?: string;
  };
  links: che.core.rest.Link[];
}

export interface KubernetesNamespace {
  name: string;
  attributes: {
    default?: 'true' | 'false';
    displayName?: string;
    phase: string;
  };
}

export interface WorkspaceSettings {
  supportedRecipeTypes: string;

  [key: string]: string;
}

export interface IResourceCreateParams {
  attributes?: IResourceQueryParams;
  namespace?: string;
  infrastructureNamespace?: string;
}

export interface IResourceQueryParams {
  [propName: string]: string | boolean | undefined;
}

export interface Preferences {
  [key: string]: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface IOAuthProvider {
  name: string;
  endpointUrl: string;
}

export interface IResources {
  getAll<T>(): AxiosPromise<T[]>;
  getSettings<T>(): AxiosPromise<T>;
  getFactoryResolver<T>(
    url: string,
    overrideParams?: { [params: string]: string },
  ): AxiosPromise<T>;
  refreshFactoryOauthToken(url: string): AxiosPromise<void>;
  generateSshKey<T>(service: string, name: string): AxiosPromise<T>;
  createSshKey(sshKeyPair: che.ssh.SshPair): AxiosPromise<void>;
  getSshKey<T>(service: string, name: string): AxiosPromise<T>;
  getAllSshKey<T>(service: string): AxiosPromise<T[]>;
  deleteSshKey(service: string, name: string): AxiosPromise<void>;
  getOAuthProviders(): AxiosPromise<IOAuthProvider[]>;
  getOAuthToken(oAuthProvider: string): AxiosPromise<{ token: string }>;
  deleteOAuthToken(oAuthProvider: string): AxiosPromise<void>;
  getCurrentUser(): AxiosPromise<User>;
  getCurrentUserProfile(): AxiosPromise<che.user.Profile>;
  getUserPreferences(filter: string | undefined): AxiosPromise<Preferences>;
  updateUserPreferences(update: Preferences): AxiosPromise<Preferences>;
  replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences>;
  deleteUserPreferences(list: string[] | undefined): AxiosPromise<void>;
  updateActivity(workspaceId: string): AxiosPromise<void>;
  getKubernetesNamespace<T>(): AxiosPromise<T>;
  provisionKubernetesNamespace(): AxiosPromise<KubernetesNamespace>;
  getApiInfo<T>(): AxiosPromise<T>;
}

export class Resources implements IResources {
  private readonly axios: AxiosInstance;
  private readonly baseUrl: string;

  private readonly workspaceUrl: string;
  private readonly factoryUrl: string;
  private readonly devfileUrl: string;

  constructor(axios: AxiosInstance, baseUrl: string) {
    this.axios = axios;
    this.baseUrl = baseUrl;

    this.workspaceUrl = '/workspace';
    this.factoryUrl = '/factory';
    this.devfileUrl = '/devfile';
  }

  public getAll<T>(): AxiosPromise<T[]> {
    return this.axios.request<T[]>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: this.workspaceUrl,
    });
  }

  public getSettings<T>(): AxiosPromise<T> {
    return this.axios.request<T>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: `${this.workspaceUrl}/settings`,
    });
  }

  public getFactoryResolver<T>(
    url: string,
    overrideParams: { [params: string]: string } = {},
  ): AxiosPromise<T> {
    const data = Object.assign({}, overrideParams, { url });

    return this.axios.request<T>({
      method: 'POST',
      baseURL: this.baseUrl,
      url: `${this.factoryUrl}/resolver/`,
      data,
    });
  }

  public refreshFactoryOauthToken(url: string): AxiosPromise<void> {
    return this.axios.request<void>({
      method: 'POST',
      baseURL: this.baseUrl,
      url: `${this.factoryUrl}/token/refresh?url=${url}`,
    });
  }

  public generateSshKey<T>(service: string, name: string): AxiosPromise<T> {
    return this.axios.request<T>({
      method: 'POST',
      baseURL: this.baseUrl,
      data: { service: service, name: name },
      url: `/ssh/generate`,
    });
  }

  public createSshKey(sshKeyPair: any): AxiosPromise<void> {
    return this.axios.request<any>({
      method: 'POST',
      data: sshKeyPair,
      baseURL: this.baseUrl,
      url: `/ssh/`,
    });
  }

  public getSshKey<T>(service: string, name: string): AxiosPromise<T> {
    return this.axios.request<any>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: `/ssh/${service}/find?name=${name}`,
    });
  }

  public getAllSshKey<T>(service: string): AxiosPromise<T[]> {
    return this.axios.request<any>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: `/ssh/${service}`,
    });
  }

  public getCurrentUser(): AxiosPromise<User> {
    return this.axios.request<User>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: `/user`,
    });
  }

  public getCurrentUserProfile(): AxiosPromise<che.user.Profile> {
    return this.axios.request<User>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: `/profile`,
    });
  }

  public deleteSshKey(service: string, name: string): AxiosPromise<void> {
    return this.axios.request<void>({
      method: 'DELETE',
      baseURL: this.baseUrl,
      url: `/ssh/${service}?name=${name}`,
    });
  }

  public getUserPreferences(filter: string | undefined = undefined): AxiosPromise<Preferences> {
    return this.axios.request<Preferences>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: filter ? `/preferences?filter=${filter}` : '/preferences',
    });
  }

  public updateUserPreferences(update: Preferences): AxiosPromise<Preferences> {
    return this.axios.request<Preferences>({
      method: 'PUT',
      baseURL: this.baseUrl,
      url: `/preferences`,
      data: update,
    });
  }

  public replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences> {
    return this.axios.request<Preferences>({
      method: 'POST',
      baseURL: this.baseUrl,
      url: `/preferences`,
      data: preferences,
    });
  }

  public deleteUserPreferences(list: string[] | undefined = undefined): AxiosPromise<void> {
    if (list) {
      return this.axios.request<void>({
        method: 'DELETE',
        baseURL: this.baseUrl,
        url: `/preferences`,
        data: list,
      });
    }
    return this.axios.request<void>({
      method: 'DELETE',
      baseURL: this.baseUrl,
      url: `/preferences`,
    });
  }

  public getOAuthToken(oAuthProvider: string): AxiosPromise<{ token: string }> {
    return this.axios.request<{ token: string }>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: `/oauth/token?oauth_provider=${oAuthProvider}`,
    });
  }

  public deleteOAuthToken(oAuthProvider: string): AxiosPromise<void> {
    return this.axios.request<void>({
      method: 'DELETE',
      baseURL: this.baseUrl,
      url: `/oauth/token?oauth_provider=${oAuthProvider}`,
    });
  }

  public getOAuthProviders(): AxiosPromise<IOAuthProvider[]> {
    return this.axios.request<IOAuthProvider[]>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: '/oauth',
    });
  }

  public updateActivity(workspaceId: string): AxiosPromise<void> {
    return this.axios.request<void>({
      method: 'PUT',
      baseURL: this.baseUrl,
      url: `/activity/${workspaceId}`,
    });
  }

  public getKubernetesNamespace<T>(): AxiosPromise<T> {
    return this.axios.request<T>({
      method: 'GET',
      baseURL: this.baseUrl,
      url: '/kubernetes/namespace',
    });
  }

  public provisionKubernetesNamespace(): AxiosPromise<KubernetesNamespace> {
    return this.axios.request({
      method: 'POST',
      baseURL: this.baseUrl,
      url: '/kubernetes/namespace/provision',
    });
  }

  public getApiInfo<T>(): AxiosPromise<T> {
    return this.axios.request<T>({
      method: 'OPTIONS',
      baseURL: this.baseUrl,
    });
  }
}
