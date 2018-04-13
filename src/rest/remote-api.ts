/*
 * Copyright (c) 2018-2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import {AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import {IWorkspace, IWorkspaceConfig, IWorkspaceSettings} from '../../typings/types';
import {IResourceCreateQueryParams, IResources} from './resources';

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

    getSettings
}

export interface IRequestConfig extends AxiosRequestConfig { }

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

class RequestError implements IRequestError {

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
        this.message = error.message;
        this.config = error.config;
        if (error.request) {
            this.request = error.request;
        }
        if (error.response) {
            this.response = error.response;
        }
    }
}

export interface IRemoteAPI {
    getAll<T = IWorkspace>(): Promise<T[]>;
    getAllByNamespace<T = IWorkspace>(namespace: string): Promise<T[]>;
    getById<T = IWorkspace>(workspaceKey: string): Promise<T>;
    create(config: IWorkspaceConfig, params: IResourceCreateQueryParams): Promise<any>;
    update(workspaceId: string, workspace: IWorkspace): Promise<any>;
    delete(workspaceId: string): Promise<any>;
    start(workspaceId: string, environmentName: string): Promise<any>;
    startTemporary(config: IWorkspaceConfig): Promise<any>;
    stop(workspaceId: string): Promise<any>;
    getSettings<T = IWorkspaceSettings>(): Promise<T>;
}

export class RemoteAPI implements IRemoteAPI {

    private promises: Map<string, AxiosPromise<any>> = new Map();

    private remoteAPI: IResources;

    constructor(remoteApi: IResources) {
        this.remoteAPI = remoteApi;
    }

    /**
     * Returns list of all user's workspaces.
     *
     * @returns {Promise<T[]>}
     */
    public getAll<T = IWorkspace>(): Promise<T[]> {
        const key = this.buildKey(METHOD.getAll);
        const promise = this.getRequestPromise(key);
        if (promise) {
            return promise;
        }

        const newPromise = new Promise<T[]>((resolve, reject) => {
            this.remoteAPI.getAll<T>()
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

    /**
     * Returns list of workspaces in the namespace.
     *
     * @param {string} namespace
     * @returns {Promise<T[]>}
     */
    public getAllByNamespace<T = IWorkspace>(namespace: string): Promise<T[]> {
        const key = this.buildKey(METHOD.getAllByNamespace, namespace);
        const promise = this.getRequestPromise(key);
        if (promise) {
            return promise;
        }

        const newPromise = new Promise<T[]>((resolve, reject) => {
            this.remoteAPI.getAllByNamespace<T>(namespace)
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

    /**
     * Returns a workspace by ID or key.
     *
     * @param {string} workspaceKey workspace ID or `namespace/workspaceName`
     * @returns {Promise<T>}
     */
    public getById<T = IWorkspace>(workspaceKey: string): Promise<T> {
        const key = this.buildKey(METHOD.getAllByNamespace, workspaceKey);
        const promise = this.getRequestPromise(key);
        if (promise) {
            return promise;
        }

        const newPromise = new Promise<T>((resolve, reject) => {
            this.remoteAPI.getById<T>(workspaceKey)
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

    /**
     * Creates a workspace from config.
     *
     * @param {IWorkspaceConfig} config a workspace config.
     * @param {IResourceCreateQueryParams} params
     * @returns {Promise<any>}
     */
    public create(config: IWorkspaceConfig, params: IResourceCreateQueryParams): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAPI.create(config, params)
                .then((response: AxiosResponse<any>) => {
                    resolve(response.data);
                })
                .catch((error: AxiosError) => {
                    reject(new RequestError(error));
                });
        });
    }

    /**
     * Updates a workspace.
     *
     * @param {string} workspaceId a workspace ID to update
     * @param {IWorkspace} workspace a new workspace data
     * @returns {Promise<any>}
     */
    public update(workspaceId: string, workspace: IWorkspace): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAPI.update(workspaceId, workspace)
                .then((response: AxiosResponse<any>) => {
                    resolve(response.data);
                })
                .catch((error: AxiosError) => {
                    reject(new RequestError(error));
                });
        });
    }

    /**
     * Deletes a workspace.
     *
     * @param {string} workspaceId a workspace ID to delete
     * @returns {Promise<any>}
     */
    public delete(workspaceId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAPI.delete(workspaceId)
                .then((response: AxiosResponse<any>) => {
                    resolve(response.data);
                })
                .catch((error: AxiosError) => {
                    reject(new RequestError(error));
                });
        });
    }

    /**
     * Starts a workspace.
     *
     * @param {string} workspaceId a workspace ID.
     * @param {string} environmentName an environment name.
     * @returns {Promise<any>}
     */
    public start(workspaceId: string, environmentName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAPI.start(workspaceId, environmentName)
                .then((response: AxiosResponse<any>) => {
                    resolve(response.data);
                })
                .catch((error: AxiosError) => {
                    reject(new RequestError(error));
                });
        });
    }

    /**
     * Starts a temporary workspace.
     *
     * @param {IWorkspaceConfig} config a workspace config.
     * @returns {Promise<any>}
     */
    public startTemporary(config: IWorkspaceConfig): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAPI.startTemporary(config)
                .then((response: AxiosResponse<any>) => {
                    resolve(response.data);
                })
                .catch((error: AxiosError) => {
                    reject(new RequestError(error));
                });
        });
    }

    /**
     * Stops a workspace.
     *
     * @param {string} workspaceId a workspace ID.
     * @returns {Promise<any>}
     */
    public stop(workspaceId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAPI.stop(workspaceId)
                .then((response: AxiosResponse<any>) => {
                    resolve(response.data);
                })
                .catch((error: AxiosError) => {
                    reject(new RequestError(error));
                });
        });
    }

    /**
     * Returns settings.
     *
     * @returns {Promise<T>}
     */
    public getSettings<T = IWorkspaceSettings>(): Promise<T> {
        const key = this.buildKey(METHOD.getSettings);
        const promise = this.getRequestPromise(key);
        if (promise) {
            return promise;
        }

        const newPromise = new Promise<T>((resolve, reject) => {
            this.remoteAPI.getSettings<T>()
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
            () => this.promises.delete(key)
        );
    }
}
