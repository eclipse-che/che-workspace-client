/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { AxiosInstance, AxiosPromise } from 'axios';
import { che } from '@eclipse-che/api';

export interface WorkspaceSettings {
    supportedRecipeTypes: string;
    [key: string]: string;
}
export interface IResourceCreateQueryParams extends IResourceQueryParams {
    attribute: string;
    namespace?: string;
}
export interface IResourceQueryParams {
    [propName: string]: string | undefined;
}
export interface Preferences {
    [key: string]: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface IResources {
    getAll: <T>() => AxiosPromise<T[]>;
    getAllByNamespace: <T>(namespace: string) => AxiosPromise<T[]>;
    getById: <T>(workspaceKey: string) => AxiosPromise<T>;
    create: (config: che.workspace.WorkspaceConfig, params: IResourceCreateQueryParams) => AxiosPromise<any>;
    update: (workspaceId: string, workspace: che.workspace.Workspace) => AxiosPromise<any>;
    delete: (workspaceId: string) => AxiosPromise<any>;
    start: (workspaceId: string, environmentName: string) => AxiosPromise<any>;
    startTemporary: (config: che.workspace.WorkspaceConfig) => AxiosPromise<any>;
    stop: (workspaceId: string) => AxiosPromise<any>;
    getSettings: <T>() => AxiosPromise<T>;
    getFactory: <T>(factoryId: string) => AxiosPromise<T>;
    generateSshKey: <T>(service: string, name: string) => AxiosPromise<T>;
    createSshKey: (sshKeyPair: che.ssh.SshPair) => AxiosPromise<void>;
    getSshKey: <T>(service: string, name: string) => AxiosPromise<T>;
    getAllSshKey: <T>(service: string) => AxiosPromise<T[]>;
    getOAuthProviders: (token?: string) => AxiosPromise<any[]>;
    deleteSshKey(service: string, name: string): AxiosPromise<void>;
    getCurrentUser(token?: string): AxiosPromise<User>;
    getUserPreferences(filter: string | undefined): AxiosPromise<Preferences>;
    updateUserPreferences(update: Preferences): AxiosPromise<Preferences>;
    replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences>;
    deleteUserPreferences(list: string[] | undefined): AxiosPromise<void>;
    getOAuthToken(oAuthProvider: string, token?: string): AxiosPromise<{ token: string }>;
    updateActivity(workspaceId: string): AxiosPromise<void>;
}

export class Resources implements IResources {

    private readonly workspaceUrl = '/workspace';
    private readonly factoryUrl = '/factory';

    constructor(private readonly axios: AxiosInstance,
        private readonly baseUrl: string,
        private readonly headers: { [headerTitle: string]: string } = {}) {
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

    public create(config: che.workspace.WorkspaceConfig, params: IResourceCreateQueryParams): AxiosPromise<any> {
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

    public update(workspaceId: string, workspace: che.workspace.Workspace): AxiosPromise<any> {
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

    public startTemporary(config: che.workspace.WorkspaceConfig): AxiosPromise<any> {
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

    public getFactory<T>(factoryId: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.factoryUrl}/${factoryId}`
        });
    }

    public generateSshKey<T>(service: string, name: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'POST',
            baseURL: this.baseUrl,
            data: {service: service, name: name},
            url: `/ssh/generate`
        });
    }

    public createSshKey(sshKeyPair: any): AxiosPromise<void> {
        return this.axios.request<any>({
            method: 'POST',
            data: sshKeyPair,
            baseURL: this.baseUrl,
            url: `/ssh/`
        });
    }

    public getSshKey<T>(service: string, name: string): AxiosPromise<T> {
        return this.axios.request<any>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/ssh/${service}/find?name=${name}`
        });
    }

    public getAllSshKey<T>(service: string): AxiosPromise<T[]> {
        return this.axios.request<any>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/ssh/${service}`
        });
    }

    public getCurrentUser(token?: string): AxiosPromise<User> {
        return this.axios.request<User>({
            method: 'GET',
            headers: this.getDefaultHeadersWithAuthorization(token),
            baseURL: this.baseUrl,
            url: `/user`
        });
    }

    public deleteSshKey(service: string, name: string): AxiosPromise<void> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `/ssh/${service}?name=${name}`
        });
    }

    public getUserPreferences(filter: string | undefined = undefined): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: filter ? `/preferences?filter=${filter}` : '/preferences'
        });
    }

    public updateUserPreferences(update: Preferences): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'PUT',
            baseURL: this.baseUrl,
            url: `/preferences`,
            data: update
        });
    }

    public replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'POST',
            baseURL: this.baseUrl,
            url: `/preferences`,
            data: preferences
        });
    }

    public deleteUserPreferences(list: string[] | undefined = undefined): AxiosPromise<void> {
        if (list) {
            return this.axios.request<void>({
                method: 'DELETE',
                baseURL: this.baseUrl,
                url: `/preferences`,
                data: list
            });
        }
        return this.axios.request<void>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `/preferences`
        });
    }

    public getOAuthToken(oAuthProvider: string, token?: string): AxiosPromise<{ token: string }> {
        return this.axios.request<{ token: string }>({
            method: 'GET',
            headers: this.getDefaultHeadersWithAuthorization(token),
            baseURL: this.baseUrl,
            url: `/oauth/token?oauth_provider=${oAuthProvider}`
        });
    }

    public getOAuthProviders(token?: string): AxiosPromise<any[]> {
        return this.axios.request<any[]>({
            method: 'GET',
            headers: this.getDefaultHeadersWithAuthorization(token),
            baseURL: this.baseUrl,
            url: '/oauth'
        });
    }

    public updateActivity(workspaceId: string): AxiosPromise<void> {
        return this.axios.request<void>({
            method: 'PUT',
            baseURL: this.baseUrl,
            url: `/activity/${workspaceId}`
        });
    }

    private getDefaultHeadersWithAuthorization(token?: string): { [key: string]: string } {
        const headers: { [key: string]: string } = {};
        for (const key in this.headers) {
            if (this.headers.hasOwnProperty(key)) {
                headers[key] = this.headers[key];
            }
        }
        if (token) {
            const header  = 'Authorization';
            headers[header] = 'Bearer ' + token;
        }
        return headers;
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

