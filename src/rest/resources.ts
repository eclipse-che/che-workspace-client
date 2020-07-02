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
    getOAuthProviders: () => AxiosPromise<any[]>;
    deleteSshKey(service: string, name: string): AxiosPromise<void>;
    getCurrentUser(): AxiosPromise<User>;
    getUserPreferences(filter: string | undefined): AxiosPromise<Preferences>;
    updateUserPreferences(update: Preferences): AxiosPromise<Preferences>;
    replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences>;
    deleteUserPreferences(list: string[] | undefined): AxiosPromise<void>;
    getOAuthToken(oAuthProvider: string): AxiosPromise<{ token: string }>;
    updateActivity(workspaceId: string): AxiosPromise<void>;
}

export class Resources implements IResources {

    private readonly workspaceUrl = '/workspace';
    private readonly factoryUrl = '/factory';

    constructor(private readonly axios: AxiosInstance,
        private readonly baseUrl: string,
        private readonly headers: { [headerTitle: string]: string } = {},
        private readonly machineToken?: string,
        private readonly userToken?: string) {
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
            url: this.workspaceUrl,
            headers: this.getHeadersWithAuthorization(this.userToken)
        });
    }

    public getAllByNamespace<T>(namespace: string): AxiosPromise<T[]> {
        return this.axios.request<T[]>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/namespace/${namespace}`,
            headers: this.getHeadersWithAuthorization(this.userToken)
        });
    }

    public getById<T>(workspaceKey: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceKey}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
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
            url: url,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public update(workspaceId: string, workspace: che.workspace.Workspace): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'PUT',
            data: workspace,
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public delete(workspaceId: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public start(workspaceId: string, environmentName: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'POST',
            data: {},
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}/runtime?environment=${environmentName}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public startTemporary(config: che.workspace.WorkspaceConfig): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'POST',
            data: config,
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/runtime?temporary=true`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public stop(workspaceId: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}/runtime`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public getSettings<T>(): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/settings`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public getFactory<T>(factoryId: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.factoryUrl}/${factoryId}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public generateSshKey<T>(service: string, name: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'POST',
            baseURL: this.baseUrl,
            data: {service: service, name: name},
            url: `/ssh/generate`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public createSshKey(sshKeyPair: any): AxiosPromise<void> {
        return this.axios.request<any>({
            method: 'POST',
            data: sshKeyPair,
            baseURL: this.baseUrl,
            url: `/ssh/`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public getSshKey<T>(service: string, name: string): AxiosPromise<T> {
        return this.axios.request<any>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/ssh/${service}/find?name=${name}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public getAllSshKey<T>(service: string): AxiosPromise<T[]> {
        return this.axios.request<any>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/ssh/${service}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public getCurrentUser(): AxiosPromise<User> {
        return this.axios.request<User>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/user`,
            headers: this.getHeadersWithAuthorization(this.userToken)
        });
    }

    public deleteSshKey(service: string, name: string): AxiosPromise<void> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `/ssh/${service}?name=${name}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public getUserPreferences(filter: string | undefined = undefined): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: filter ? `/preferences?filter=${filter}` : '/preferences',
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public updateUserPreferences(update: Preferences): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'PUT',
            baseURL: this.baseUrl,
            url: `/preferences`,
            data: update,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'POST',
            baseURL: this.baseUrl,
            url: `/preferences`,
            data: preferences,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public deleteUserPreferences(list: string[] | undefined = undefined): AxiosPromise<void> {
        if (list) {
            return this.axios.request<void>({
                method: 'DELETE',
                baseURL: this.baseUrl,
                url: `/preferences`,
                data: list,
                headers: this.getHeadersWithAuthorization(this.machineToken)
            });
        }
        return this.axios.request<void>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `/preferences`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    public getOAuthToken(oAuthProvider: string): AxiosPromise<{ token: string }> {
        return this.axios.request<{ token: string }>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/oauth/token?oauth_provider=${oAuthProvider}`,
            headers: this.getHeadersWithAuthorization(this.userToken)
        });
    }

    public getOAuthProviders(): AxiosPromise<any[]> {
        return this.axios.request<any[]>({
            method: 'GET',
            headers: this.getHeadersWithAuthorization(this.userToken),
            baseURL: this.baseUrl,
            url: '/oauth'
        });
    }

    public updateActivity(workspaceId: string): AxiosPromise<void> {
        return this.axios.request<void>({
            method: 'PUT',
            baseURL: this.baseUrl,
            url: `/activity/${workspaceId}`,
            headers: this.getHeadersWithAuthorization(this.machineToken)
        });
    }

    private getHeadersWithAuthorization(token?: string): { [key: string]: string } {
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

