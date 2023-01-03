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

import { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  IResources,
  WorkspaceSettings,
  Preferences,
  User,
  KubernetesNamespace,
  IResourceQueryParams,
  IResourceCreateParams,
  FactoryResolver,
} from './resources';
import { che } from '@eclipse-che/api';

export enum METHOD {
  getAll,
  getAllByNamespace,
  fetchById,

  create,
  update,
  delete,
  start,
  startTemporary,
  stop,

  getSettings,
}

export type IRequestConfig = AxiosRequestConfig;

export interface IResponse<T> extends AxiosResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: IRequestConfig;
  request?: any;
}

export interface IRequestError extends Error {
  status?: number;
  config: AxiosRequestConfig;
  request?: any;
  response?: IResponse<any>;
}

export class RequestError implements IRequestError {
  status: number | undefined;
  name: string;
  message: string;
  config: AxiosRequestConfig;
  request: any;
  response: AxiosResponse | undefined;

  constructor(error: AxiosError) {
    if (error.code) {
      this.status = Number(error.code);
    }
    this.name = error.name;
    this.config = error.config;
    if (error.request) {
      this.request = error.request;
    }
    if (error.response) {
      this.response = error.response;
    }
    if (
      (this.status === -1 || !this.status) &&
      (!this.response || (this.response && !this.response.status))
    ) {
      // request is interrupted, there is not even an error
      this.message = `network issues occured while requesting "${this.config.url}".`;
    } else if (this.response && this.response.data && this.response.data.message) {
      // che Server error that should be self-descriptive
      this.message = this.response.data.message;
    } else {
      // the error is not from Che Server, so error may be in html format that we're not able to handle.
      // displaying just a error code and URL.

      // sometimes status won't be defined, so when it's not look into the response status more info
      let status = this.status;
      if (!this.status && this.response && this.response.status) {
        status = this.response.status;
        // defer to the status code of the request if there is no response
      } else if (!this.status && this.request && this.request.status) {
        status = this.request.status;
      }
      this.message = `"${status}" returned by "${this.config.url}"."`;
    }
  }
}

export interface IRemoteAPI {
  /**
   * Returns list of all user's workspaces.
   */
  getAll<T = che.workspace.Workspace>(): Promise<T[]>;
  /**
   * Returns settings.
   */
  getSettings<T = WorkspaceSettings>(): Promise<T>;
  /**
   * Returns a factory resolver.
   */
  getFactoryResolver<T = FactoryResolver>(
    url: string,
    overrideParams?: { [params: string]: string },
  ): Promise<T>;

  /**
   * Check the factory related OAuth token and set (update) git-credentials.
   */
  refreshFactoryOauthToken(url: string): Promise<void>;
  generateSshKey<T = che.ssh.SshPair>(service: string, name: string): Promise<T>;
  createSshKey(sshKeyPair: che.ssh.SshPair): Promise<void>;
  getSshKey<T = che.ssh.SshPair>(service: string, name: string): Promise<T>;
  getAllSshKey<T = che.ssh.SshPair>(service: string): Promise<T[]>;
  deleteSshKey(service: string, name: string): Promise<void>;
  /**
   * Return the current authenticated user
   */
  getCurrentUser(): Promise<User>;
  getCurrentUserProfile(): Promise<che.user.Profile>;
  getUserPreferences(): Promise<Preferences>;
  getUserPreferences(filter: string | undefined): Promise<Preferences>;
  updateUserPreferences(update: Preferences): Promise<Preferences>;
  replaceUserPreferences(preferences: Preferences): Promise<Preferences>;
  deleteUserPreferences(): Promise<void>;
  deleteUserPreferences(list: string[] | undefined): Promise<void>;
  /**
   * Return registered oauth token.
   *
   * @param oAuthProvider oauth provider's name e.g. github.
   */
  getOAuthToken(oAuthProvider: string): Promise<string>;
  /**
   * Delete registered oauth token.
   *
   * @param oAuthProvider oauth provider's name e.g. github.
   */
  deleteOAuthToken(oAuthProvider: string): Promise<void>;
  /**
   * Return list of registered oAuth providers.
   */
  getOAuthProviders(): Promise<{ name: string,  endpointUrl: string }[]>;
  /**
   * Updates workspace activity timestamp to prevent stop by timeout when workspace is running and using.
   *
   * @param workspaceId a workspace ID to update activity timestamp
   */
  updateActivity(workspaceId: string): Promise<void>;
  /**
   * Returns list of kubernetes namespace.
   */
  getKubernetesNamespace<T = KubernetesNamespace[]>(): Promise<T>;
  /**
   * Provision k8s namespace where user is able to create workspaces. Returns the kubernetes namespace.
   */
  provisionKubernetesNamespace(): Promise<KubernetesNamespace>;
  /**
   * Returns the che server api information
   */
  getApiInfo<T>(): Promise<T>;
}

export class RemoteAPI implements IRemoteAPI {
  private promises: Map<string, AxiosPromise<any>> = new Map();

  private remoteAPI: IResources;

  constructor(remoteApi: IResources) {
    this.remoteAPI = remoteApi;
  }

  public getAll<T = che.workspace.Workspace>(): Promise<T[]> {
    const key = this.buildKey(METHOD.getAll);
    const promise = this.getRequestPromise(key);
    if (promise) {
      return promise;
    }

    const newPromise = new Promise<T[]>((resolve, reject) => {
      this.remoteAPI
        .getAll<T>()
        .then((response: AxiosResponse<T[]>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
    this.saveRequestPromise(key, newPromise);

    return newPromise;
  }

  public getSettings<T = WorkspaceSettings>(): Promise<T> {
    const key = this.buildKey(METHOD.getSettings);
    const promise = this.getRequestPromise(key);
    if (promise) {
      return promise;
    }

    const newPromise = new Promise<T>((resolve, reject) => {
      this.remoteAPI
        .getSettings<T>()
        .then((response: AxiosResponse<T>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
    this.saveRequestPromise(key, newPromise);

    return newPromise;
  }

  getFactoryResolver<T = FactoryResolver>(
    url: string,
    overrideParams?: { [params: string]: string },
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.remoteAPI
        .getFactoryResolver<T>(url, overrideParams)
        .then((response: AxiosResponse<T>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  refreshFactoryOauthToken(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .refreshFactoryOauthToken(url)
        .then(() => resolve())
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public generateSshKey<T = che.ssh.SshPair>(service: string, name: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.remoteAPI
        .generateSshKey<T>(service, name)
        .then((response: AxiosResponse<T>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public createSshKey(sshKeyPair: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .createSshKey(sshKeyPair)
        .then((response: AxiosResponse<void>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public getSshKey<T = che.ssh.SshPair>(service: string, name: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.remoteAPI
        .getSshKey<T>(service, name)
        .then((response: AxiosResponse<T>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public getAllSshKey<T = che.ssh.SshPair>(service: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      this.remoteAPI
        .getAllSshKey<T>(service)
        .then((response: AxiosResponse<T[]>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public deleteSshKey(service: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .deleteSshKey(service, name)
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public getCurrentUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .getCurrentUser()
        .then((response: AxiosResponse<User>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public getCurrentUserProfile(): Promise<che.user.Profile> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .getCurrentUserProfile()
        .then((response: AxiosResponse<che.user.Profile>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public getUserPreferences(filter: string | undefined = undefined): Promise<Preferences> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .getUserPreferences(filter)
        .then((response: AxiosResponse<Preferences>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public updateUserPreferences(update: Preferences): Promise<Preferences> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .updateUserPreferences(update)
        .then((response: AxiosResponse<Preferences>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public replaceUserPreferences(preferences: Preferences): Promise<Preferences> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .replaceUserPreferences(preferences)
        .then((response: AxiosResponse<Preferences>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public deleteUserPreferences(list: string[] | undefined = undefined): Promise<void> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .deleteUserPreferences(list)
        .then(() => {
          resolve();
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  getOAuthToken(oAuthProvider: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .getOAuthToken(oAuthProvider)
        .then((response: AxiosResponse<{ token: string }>) => {
          resolve(response.data.token);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  deleteOAuthToken(oAuthProvider: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .deleteOAuthToken(oAuthProvider)
        .then(() => resolve())
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  getOAuthProviders(): Promise<{ name: string,  endpointUrl: string }[]> {
    return new Promise<{ name: string,  endpointUrl: string }[]>((resolve, reject) => {
      this.remoteAPI
        .getOAuthProviders()
        .then((response: AxiosResponse<any[]>) => {
          resolve(response.data.map(provider => {
            const { name,  endpointUrl } = provider;
            return { name,  endpointUrl}
          }));
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  getKubernetesNamespace<T = KubernetesNamespace[]>(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.remoteAPI
        .getKubernetesNamespace<T>()
        .then((response: AxiosResponse<T>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  provisionKubernetesNamespace(): Promise<KubernetesNamespace> {
    return new Promise((resolve, reject) => {
      this.remoteAPI
        .provisionKubernetesNamespace()
        .then((response: AxiosResponse<KubernetesNamespace>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  getApiInfo<T>(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.remoteAPI
        .getApiInfo<T>()
        .then((response: AxiosResponse<T>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  public updateActivity(workspaceId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.remoteAPI
        .updateActivity(workspaceId)
        .then(() => resolve())
        .catch((error: AxiosError) => {
          reject(new RequestError(error));
        });
    });
  }

  /**
   * Returns a string key to identify the request.
   *
   * @param {METHOD} method a method name
   * @param {string} args
   * @returns {string}
   */
  protected buildKey(method: METHOD, ...args: string[]): string {
    args.unshift(method.toString());
    return args.join('-');
  }

  /**
   * Returns stored request promise by a string key.
   *
   * @param {string} key a key to identify the request promise
   * @returns {Promise<any> | undefined}
   */
  protected getRequestPromise(key: string): Promise<any> | undefined {
    return this.promises.get(key);
  }

  /**
   * Save the request promise.
   *
   * @param {string} key a key to identify the request promise.
   * @param {Promise<any>} promise a request promise
   */
  protected saveRequestPromise(key: string, promise: Promise<any>): void {
    this.promises.set(key, promise);
    promise.then(
      () => this.promises.delete(key),
      () => this.promises.delete(key),
    );
  }
}
