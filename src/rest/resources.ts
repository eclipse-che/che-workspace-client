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
import * as Qs from 'qs';

export interface FactoryResolver {
    v: string;
    source: string;
    devfile: che.workspace.devfile.Devfile
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

export interface IResources {
    getAll<T>(): AxiosPromise<T[]>;
    getAllByNamespace<T>(namespace: string): AxiosPromise<T[]>;
    getById<T>(workspaceKey: string): AxiosPromise<T>;
    create<T>(devfile: che.workspace.devfile.Devfile, createParams: IResourceCreateParams | undefined): AxiosPromise<T>;
    update(workspaceId: string, workspace: che.workspace.Workspace): AxiosPromise<any>;
    delete(workspaceId: string): AxiosPromise<any>;
    start(workspaceId: string, params: IResourceQueryParams | undefined): AxiosPromise<any>;
    stop(workspaceId: string): AxiosPromise<any>;
    getSettings<T>(): AxiosPromise<T>;
    getFactoryResolver<T>(url: string, headers?: { [name: string]: string }): AxiosPromise<T>;
    generateSshKey<T>(service: string, name: string): AxiosPromise<T>;
    createSshKey(sshKeyPair: che.ssh.SshPair): AxiosPromise<void>;
    getSshKey<T>(service: string, name: string): AxiosPromise<T>;
    getAllSshKey<T>(service: string): AxiosPromise<T[]>;
    getOAuthProviders(): AxiosPromise<any[]>;
    deleteSshKey(service: string, name: string): AxiosPromise<void>;
    getCurrentUser(): AxiosPromise<User>;
    getUserPreferences(filter: string | undefined): AxiosPromise<Preferences>;
    updateUserPreferences(update: Preferences): AxiosPromise<Preferences>;
    replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences>;
    deleteUserPreferences(list: string[] | undefined): AxiosPromise<void>;
    getOAuthToken(oAuthProvider: string): AxiosPromise<{ token: string }>;
    updateActivity(workspaceId: string): AxiosPromise<void>;
    getKubernetesNamespace<T>(): AxiosPromise<T>;
    getDevfileSchema<T>(): AxiosPromise<T>;
}

export class Resources implements IResources {

    private readonly workspaceUrl = '/workspace';
    private readonly factoryUrl = '/factory';
    private readonly devfileUrl = '/devfile';

    constructor(private readonly axios: AxiosInstance,
                private readonly baseUrl: string,
                private readonly _headers: { [headerTitle: string]: string } = {},
                private readonly token?: string) {
        for (const title in _headers) {
            if (_headers.hasOwnProperty(title)) {
                this.axios.defaults.headers.common[title] = _headers[title];
            }
        }
    }

    public getAll<T>(): AxiosPromise<T[]> {
        return this.axios.request<T[]>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.workspaceUrl,
            headers: this.headers,
        });
    }

    public getAllByNamespace<T>(namespace: string): AxiosPromise<T[]> {
        return this.axios.request<T[]>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/namespace/${namespace}`,
            headers: this.headers,
        });
    }

    public getById<T>(workspaceKey: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceKey}`,
            headers: this.headers,
        });
    }

    public create<T>(devfile: che.workspace.devfile.Devfile, createParams: IResourceCreateParams = {}): AxiosPromise<T> {
        const {attributes, namespace, infrastructureNamespace} = createParams;
        const attr = attributes ? Object.keys(attributes).map(key => `${key}:${attributes[key]}`) : [];
        return this.axios.request<T>({
            method: 'POST',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${this.devfileUrl}`,
            data: devfile,
            params: {
                attribute: attr,
                namespace: namespace,
                'infrastructure-namespace': infrastructureNamespace,
            },
            paramsSerializer: function (params) {
                return Qs.stringify(params, {arrayFormat: 'repeat'});
            },
            headers: this.headers,
        });
    }

    public update(workspaceId: string, workspace: che.workspace.Workspace): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'PUT',
            data: workspace,
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}`,
            headers: this.headers,
        });
    }

    public delete(workspaceId: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}`,
            headers: this.headers,
        });
    }

    public start(workspaceId: string, params: IResourceQueryParams | undefined): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'POST',
            data: {},
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}/runtime`,
            headers: this.headers,
            params : params ? params : {}
        });
    }

    public stop(workspaceId: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}/runtime`,
            headers: this.headers,
        });
    }

    public getSettings<T>(): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/settings`,
            headers: this.headers,
        });
    }

    public getFactoryResolver<T>(url: string, headers?: { [name: string]: string }): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'POST',
            baseURL: this.baseUrl,
            url: `${this.factoryUrl}/resolver/`,
            headers: headers ? headers : {'Authorization': undefined},
            data: {url},
        });
    }

    public generateSshKey<T>(service: string, name: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'POST',
            baseURL: this.baseUrl,
            data: {service: service, name: name},
            url: `/ssh/generate`,
            headers: this.headers,
        });
    }

    public createSshKey(sshKeyPair: any): AxiosPromise<void> {
        return this.axios.request<any>({
            method: 'POST',
            data: sshKeyPair,
            baseURL: this.baseUrl,
            url: `/ssh/`,
            headers: this.headers,
        });
    }

    public getSshKey<T>(service: string, name: string): AxiosPromise<T> {
        return this.axios.request<any>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/ssh/${service}/find?name=${name}`,
            headers: this.headers,
        });
    }

    public getAllSshKey<T>(service: string): AxiosPromise<T[]> {
        return this.axios.request<any>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/ssh/${service}`,
            headers: this.headers,
        });
    }

    public getCurrentUser(): AxiosPromise<User> {
        return this.axios.request<User>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/user`,
            headers: this.headers,
        });
    }

    public deleteSshKey(service: string, name: string): AxiosPromise<void> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `/ssh/${service}?name=${name}`,
            headers: this.headers,
        });
    }

    public getUserPreferences(filter: string | undefined = undefined): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: filter ? `/preferences?filter=${filter}` : '/preferences',
            headers: this.headers,
        });
    }

    public updateUserPreferences(update: Preferences): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'PUT',
            baseURL: this.baseUrl,
            url: `/preferences`,
            data: update,
            headers: this.headers,
        });
    }

    public replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences> {
        return this.axios.request<Preferences>({
            method: 'POST',
            baseURL: this.baseUrl,
            url: `/preferences`,
            data: preferences,
            headers: this.headers,
        });
    }

    public deleteUserPreferences(list: string[] | undefined = undefined): AxiosPromise<void> {
        if (list) {
            return this.axios.request<void>({
                method: 'DELETE',
                baseURL: this.baseUrl,
                url: `/preferences`,
                data: list,
                headers: this.headers,
            });
        }
        return this.axios.request<void>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `/preferences`,
            headers: this.headers,
        });
    }

    public getOAuthToken(oAuthProvider: string): AxiosPromise<{ token: string }> {
        return this.axios.request<{ token: string }>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `/oauth/token?oauth_provider=${oAuthProvider}`,
            headers: this.headers,
        });
    }

    public getOAuthProviders(): AxiosPromise<any[]> {
        return this.axios.request<any[]>({
            method: 'GET',
            headers: this.headers,
            baseURL: this.baseUrl,
            url: '/oauth',
        });
    }

    public updateActivity(workspaceId: string): AxiosPromise<void> { // -
        return this.axios.request<void>({
            method: 'PUT',
            baseURL: this.baseUrl,
            url: `/activity/${workspaceId}`,
            headers: this.headers,
        });
    }

    public getDevfileSchema<T>(): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.devfileUrl,
            headers: this.headers,
        });
    }

    public getKubernetesNamespace<T>(): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: '/kubernetes/namespace',
            headers: this.headers,
        });
    }

    private get headers(): { [key: string]: string } {
        const headers: { [key: string]: string } = {};
        for (const key in this._headers) {
            if (this._headers.hasOwnProperty(key)) {
                headers[key] = this._headers[key];
            }
        }
        if (this.token) {
            const header = 'Authorization';
            headers[header] = `Bearer ${this.token}`;
        }
        return headers;
    }

}

