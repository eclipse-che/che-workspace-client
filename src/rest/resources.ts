/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { AxiosInstance, AxiosPromise} from 'axios';
import { IWorkspace, IWorkspaceConfig } from '../../typings/types';

export interface IResourceCreateQueryParams extends IResourceQueryParams {
    attribute: string;
    namespace?: string;
}
export interface IResourceQueryParams {
    [propName: string]: string | undefined;
}

export interface IResources {
    getAll: <T>() => AxiosPromise<T[]>;
    getAllByNamespace: <T>(namespace: string) => AxiosPromise<T[]>;
    getById: <T>(workspaceKey: string) => AxiosPromise<T>;
    create: (config: IWorkspaceConfig, params: IResourceCreateQueryParams) => AxiosPromise<any>;
    update: (workspaceId: string, workspace: IWorkspace) => AxiosPromise<any>;
    delete: (workspaceId: string) => AxiosPromise<any>;
    start: (workspaceId: string, environmentName: string) => AxiosPromise<any>;
    startTemporary: (config: IWorkspaceConfig) => AxiosPromise<any>;
    stop: (workspaceId: string) => AxiosPromise<any>;
    getSettings: <T>() => AxiosPromise<T>;
}

export class Resources implements IResources {

    private readonly workspaceUrl = '/workspace';

    constructor(private readonly axios: AxiosInstance,
                private readonly baseUrl: string,
                private readonly headers: {[headerTitle: string]: string} = {}) {
        for (const title in headers) {
            if (headers.hasOwnProperty(title)) {
                this.axios.defaults.headers.common[title] = headers[title];
            }
        }
    }

    public getAll<T>(): AxiosPromise<T[]> {
        return this.axios.request<T[]>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.workspaceUrl
        });
    }

    public getAllByNamespace<T>(namespace: string): AxiosPromise<T[]> {
        return this.axios.request<T[]>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/namespace/${namespace}`
        });
    }

    public getById<T>(workspaceKey: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceKey}`
        });
    }

    public create(config: IWorkspaceConfig, params: IResourceCreateQueryParams): AxiosPromise<any> {
        let encodedParams = `attribute=${params.attribute}`; // it contains colon ":" which shouldn't be encoded
        delete params.attribute;
        if (params.namespace) {
            encodedParams += '&' + this.encode(params);
        }
        let url = `${this.workspaceUrl}?${encodedParams}`;

        return this.axios.request<any>({
            method: 'POST',
            data: config,
            baseURL: this.baseUrl,
            url: url
        });
    }

    public update(workspaceId: string, workspace: IWorkspace): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'PUT',
            data: workspace,
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}`
        });
    }

    public delete(workspaceId: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}`
        });
    }

    public start(workspaceId: string, environmentName: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'POST',
            data: {},
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}/runtime?environment=${environmentName}`
        });
    }

    public startTemporary(config: IWorkspaceConfig): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'POST',
            data: config,
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/runtime?temporary=true`,
        });
    }

    public stop(workspaceId: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}/runtime`
        });
    }

    public getSettings<T>(): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/settings`
        });
    }

    private encode(params: IResourceQueryParams): string {
        if (typeof window !== 'undefined') {
            // in browser
            const searchParams = new URLSearchParams();
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    const value = params[key];
                    if (value) {
                        searchParams.append(key, value);
                    }
                }
            }
            return searchParams.toString();
        } else {
            // in nodejs
            const querystring = require('querystring');
            return querystring.stringify(params);
        }
    }

}

