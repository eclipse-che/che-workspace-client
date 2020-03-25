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
    getOAuthToken(oAuthProvider: string): AxiosPromise<{
        token: string;
    }>;
    updateActivity(workspaceId: string): AxiosPromise<void>;
}
export declare class Resources implements IResources {
    private readonly axios;
    private readonly baseUrl;
    private readonly headers;
    private readonly workspaceUrl;
    private readonly factoryUrl;
    constructor(axios: AxiosInstance, baseUrl: string, headers?: {
        [headerTitle: string]: string;
    });
    getAll<T>(): AxiosPromise<T[]>;
    getAllByNamespace<T>(namespace: string): AxiosPromise<T[]>;
    getById<T>(workspaceKey: string): AxiosPromise<T>;
    create(config: che.workspace.WorkspaceConfig, params: IResourceCreateQueryParams): AxiosPromise<any>;
    update(workspaceId: string, workspace: che.workspace.Workspace): AxiosPromise<any>;
    delete(workspaceId: string): AxiosPromise<any>;
    start(workspaceId: string, environmentName: string): AxiosPromise<any>;
    startTemporary(config: che.workspace.WorkspaceConfig): AxiosPromise<any>;
    stop(workspaceId: string): AxiosPromise<any>;
    getSettings<T>(): AxiosPromise<T>;
    getFactory<T>(factoryId: string): AxiosPromise<T>;
    generateSshKey<T>(service: string, name: string): AxiosPromise<T>;
    createSshKey(sshKeyPair: any): AxiosPromise<void>;
    getSshKey<T>(service: string, name: string): AxiosPromise<T>;
    getAllSshKey<T>(service: string): AxiosPromise<T[]>;
    getCurrentUser(): AxiosPromise<User>;
    deleteSshKey(service: string, name: string): AxiosPromise<void>;
    getUserPreferences(filter?: string | undefined): AxiosPromise<Preferences>;
    updateUserPreferences(update: Preferences): AxiosPromise<Preferences>;
    replaceUserPreferences(preferences: Preferences): AxiosPromise<Preferences>;
    deleteUserPreferences(list?: string[] | undefined): AxiosPromise<void>;
    getOAuthToken(oAuthProvider: string): AxiosPromise<{
        token: string;
    }>;
    getOAuthProviders(): AxiosPromise<any[]>;
    updateActivity(workspaceId: string): AxiosPromise<void>;
    private encode(params);
}
