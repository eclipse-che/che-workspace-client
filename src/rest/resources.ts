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
    getFactoryResolver<T>(url: string): AxiosPromise<T>;
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

    public getAllByNamespace<T>(namespace: string): AxiosPromise<T[]> {
        return this.axios.request<T[]>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/namespace/${namespace}`,
        });
    }

    public getById<T>(workspaceKey: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceKey}`,
        });
    }

    public create<T>(devfile: che.workspace.devfile.Devfile, createParams: IResourceCreateParams = {}): AxiosPromise<T> {
        const {attributes, namespace, infrastructureNamespace} = createParams;
        const attr = attributes ? Object.keys(attributes).map(key => `${key}:${attributes[key]}`) : [];
        return this.axios.request<T>({
            method: 'POST',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/devfile`,
            data: devfile,
            params: {
                attribute: attr,
                namespace: namespace,
                'infrastructure-namespace': infrastructureNamespace,
            },
            paramsSerializer: function (params) {
                return Qs.stringify(params, {arrayFormat: 'repeat'});
            },
        });
    }

    public update(workspaceId: string, workspace: che.workspace.Workspace): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'PUT',
            data: workspace,
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}`,
        });
    }

    public delete(workspaceId: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}`,
        });
    }

    public start(workspaceId: string, params: IResourceQueryParams | undefined): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'POST',
            data: {},
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}/runtime`,
            params : params ? params : {},
        });
    }

    public stop(workspaceId: string): AxiosPromise<any> {
        return this.axios.request<any>({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/${workspaceId}/runtime`,
        });
    }

    public getSettings<T>(): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: `${this.workspaceUrl}/settings`,
        });
    }

    public getFactoryResolver<T>(url: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'POST',
            baseURL: this.baseUrl,
            url: `${this.factoryUrl}/resolver/`,
            data: {url}
        });
    }

    public generateSshKey<T>(service: string, name: string): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'POST',
            baseURL: this.baseUrl,
            data: {service: service, name: name},
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

    public deleteSshKey(service: string, name: string): AxiosPromise<void> {
        return this.axios.request<any>({
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

    public getOAuthProviders(): AxiosPromise<any[]> {
        return this.axios.request<any[]>({
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

    public getDevfileSchema<T>(): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.devfileUrl,
        });
    }

    public getKubernetesNamespace<T>(): AxiosPromise<T> {
        return this.axios.request<T>({
            method: 'GET',
            baseURL: this.baseUrl,
            url: '/kubernetes/namespace',
        });
    }
}

