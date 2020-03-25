/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IResourceCreateQueryParams, IResources, WorkspaceSettings, Preferences, User } from './resources';
import { che } from '@eclipse-che/api';
export declare enum METHOD {
    getAll = 0,
    getAllByNamespace = 1,
    fetchById = 2,
    create = 3,
    update = 4,
    delete = 5,
    start = 6,
    startTemporary = 7,
    stop = 8,
    getSettings = 9,
}
export interface IRequestConfig extends AxiosRequestConfig {
}
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
export interface IRemoteAPI {
    getAll<T = che.workspace.Workspace>(): Promise<T[]>;
    getAllByNamespace<T = che.workspace.Workspace>(namespace: string): Promise<T[]>;
    getById<T = che.workspace.Workspace>(workspaceKey: string): Promise<T>;
    create(config: che.workspace.WorkspaceConfig, params: IResourceCreateQueryParams): Promise<any>;
    update(workspaceId: string, workspace: che.workspace.Workspace): Promise<any>;
    delete(workspaceId: string): Promise<any>;
    start(workspaceId: string, environmentName: string): Promise<any>;
    startTemporary(config: che.workspace.WorkspaceConfig): Promise<any>;
    stop(workspaceId: string): Promise<any>;
    getSettings<T = WorkspaceSettings>(): Promise<T>;
    getFactory<T = che.factory.Factory>(factoryId: string): Promise<T>;
    generateSshKey<T = che.ssh.SshPair>(service: string, name: string): Promise<T>;
    createSshKey(sshKeyPair: che.ssh.SshPair): Promise<void>;
    getSshKey<T = che.ssh.SshPair>(service: string, name: string): Promise<T>;
    getAllSshKey<T = che.ssh.SshPair>(service: string): Promise<T[]>;
    deleteSshKey(service: string, name: string): Promise<void>;
    getCurrentUser(): Promise<User>;
    getUserPreferences(): Promise<Preferences>;
    getUserPreferences(filter: string | undefined): Promise<Preferences>;
    updateUserPreferences(update: Preferences): Promise<Preferences>;
    replaceUserPreferences(preferences: Preferences): Promise<Preferences>;
    deleteUserPreferences(): Promise<void>;
    deleteUserPreferences(list: string[] | undefined): Promise<void>;
    getOAuthToken(oAuthProvider: string): Promise<string>;
    getOAuthProviders(): Promise<string[]>;
    updateActivity(workspaceId: string): Promise<void>;
}
export declare class RemoteAPI implements IRemoteAPI {
    private promises;
    private remoteAPI;
    constructor(remoteApi: IResources);
    /**
     * Returns list of all user's workspaces.
     *
     * @returns {Promise<T[]>}
     */
    getAll<T = che.workspace.Workspace>(): Promise<T[]>;
    /**
     * Returns list of workspaces in the namespace.
     *
     * @param {string} namespace
     * @returns {Promise<T[]>}
     */
    getAllByNamespace<T = che.workspace.Workspace>(namespace: string): Promise<T[]>;
    /**
     * Returns a workspace by ID or key.
     *
     * @param {string} workspaceKey workspace ID or `namespace/workspaceName`
     * @returns {Promise<T>}
     */
    getById<T = che.workspace.Workspace>(workspaceKey: string): Promise<T>;
    /**
     * Creates a workspace from config.
     *
     * @param {IWorkspaceConfig} config a workspace config.
     * @param {IResourceCreateQueryParams} params
     * @returns {Promise<any>}
     */
    create(config: che.workspace.WorkspaceConfig, params: IResourceCreateQueryParams): Promise<any>;
    /**
     * Updates a workspace.
     *
     * @param {string} workspaceId a workspace ID to update
     * @param {IWorkspace} workspace a new workspace data
     * @returns {Promise<any>}
     */
    update(workspaceId: string, workspace: che.workspace.Workspace): Promise<any>;
    /**
     * Deletes a workspace.
     *
     * @param {string} workspaceId a workspace ID to delete
     * @returns {Promise<any>}
     */
    delete(workspaceId: string): Promise<any>;
    /**
     * Starts a workspace.
     *
     * @param {string} workspaceId a workspace ID.
     * @param {string} environmentName an environment name.
     * @returns {Promise<any>}
     */
    start(workspaceId: string, environmentName: string): Promise<any>;
    /**
     * Starts a temporary workspace.
     *
     * @param {IWorkspaceConfig} config a workspace config.
     * @returns {Promise<any>}
     */
    startTemporary(config: che.workspace.WorkspaceConfig): Promise<any>;
    /**
     * Stops a workspace.
     *
     * @param {string} workspaceId a workspace ID.
     * @returns {Promise<any>}
     */
    stop(workspaceId: string): Promise<any>;
    /**
     * Returns settings.
     *
     * @returns {Promise<T>}
     */
    getSettings<T = WorkspaceSettings>(): Promise<T>;
    /**
     * Returns a factory by ID.
     *
     * @param {string} factoryId factory ID
     * @returns {Promise<T>}
     */
    getFactory<T = che.factory.Factory>(factoryId: string): Promise<T>;
    generateSshKey<T = che.ssh.SshPair>(service: string, name: string): Promise<T>;
    createSshKey(sshKeyPair: any): Promise<void>;
    getSshKey<T = che.ssh.SshPair>(service: string, name: string): Promise<T>;
    getAllSshKey<T = che.ssh.SshPair>(service: string): Promise<T[]>;
    deleteSshKey(service: string, name: string): Promise<void>;
    getCurrentUser(): Promise<User>;
    getUserPreferences(filter?: string | undefined): Promise<Preferences>;
    updateUserPreferences(update: Preferences): Promise<Preferences>;
    replaceUserPreferences(preferences: Preferences): Promise<Preferences>;
    deleteUserPreferences(list?: string[] | undefined): Promise<void>;
    getOAuthToken(oAuthProvider: string): Promise<string>;
    getOAuthProviders(): Promise<string[]>;
    /**
     * Updates workspace activity timestamp to prevent stop by timeout when workspace is running and using.
     *
     * @param {string} workspaceId a workspace ID to update activity timestamp
     * @returns {Promise<any>}
     */
    updateActivity(workspaceId: string): Promise<void>;
    /**
     * Returns a string key to identify the request.
     *
     * @param {METHOD} method a method name
     * @param {string} args
     * @returns {string}
     */
    protected buildKey(method: METHOD, ...args: string[]): string;
    /**
     * Returns stored request promise by a string key.
     *
     * @param {string} key a key to identify the request promise
     * @returns {Promise<any> | undefined}
     */
    protected getRequestPromise(key: string): Promise<any> | undefined;
    /**
     * Save the request promise.
     *
     * @param {string} key a key to identify the request promise.
     * @param {Promise<any>} promise a request promise
     */
    protected saveRequestPromise(key: string, promise: Promise<any>): void;
}
