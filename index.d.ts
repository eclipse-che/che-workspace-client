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

import {IWorkspace, IWorkspaceConfig} from './typings/types';

export * from './typings/types';

export default class WorkspaceClient {
    static getRestApi(config?: IRestAPIConfig): IRemoteAPI;

    static getRestBackend(): IBackend;

    static getJsonRpcApi(entryPoint: string): IWorkspaceMasterApi;
}

export interface IWorkspaceMasterApi {
    /**
     * Opens connection to pointed entryPoint.
     *
     * @param entryPoint
     * @returns {Promise<any>}
     */
    connect(entryPoint: string): Promise<any>;

    /**
     * Subscribes the environment output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeEnvironmentOutput(workspaceId: string, callback: Function): void;

    /**
     * Un-subscribes the pointed callback from the environment output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeEnvironmentOutput(workspaceId: string, callback: Function): void;

    /**
     * Subscribes the environment status changed.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeEnvironmentStatus(workspaceId: string, callback: Function): void;

    /**
     * Un-subscribes the pointed callback from environment status changed.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeEnvironmentStatus(workspaceId: string, callback: Function): void;

    /**
     * Subscribes on workspace agent output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeWsAgentOutput(workspaceId: string, callback: Function): void;

    /**
     * Un-subscribes from workspace agent output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeWsAgentOutput(workspaceId: string, callback: Function): void;

    /**
     * Subscribes to workspace's status.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeWorkspaceStatus(workspaceId: string, callback: Function): void;

    /**
     * Un-subscribes pointed callback from workspace's status.
     *
     * @param workspaceId
     * @param callback
     */
    unSubscribeWorkspaceStatus(workspaceId: string, callback: Function): void;

    /**
     * Subscribe to organization statuses.
     *
     * @param {string} organizationId organization's id
     * @param {IClientEventHandler} callback handler
     */
    subscribeOrganizationStatus(organizationId: string, callback: Function): void;

    /**
     * Un-subscribe from organization status changes.
     *
     * @param {string} organizationId organization's id
     * @param {IClientEventHandler} callback handler
     */
    unSubscribeOrganizationStatus(organizationId: string, callback: Function): void;

    /**
     * Subscribe to organization membership changes.
     *
     * @param {string} userId user's id to track changes
     * @param {IClientEventHandler} callback handler
     */
    subscribeOrganizationMembershipStatus(userId: string, callback: Function): void;

    /**
     * Un-subscribe from organization membership changes.
     *
     * @param {string} userId user's id to untrack changes
     * @param {IClientEventHandler} callback handler
     */
    unSubscribeOrganizationMembershipStatus(userId: string, callback: Function): void;

    /**
     * Fetch client's id and stores it.
     *
     * @returns {Promise<any>}
     */
    fetchClientId(): Promise<any>;

    /**
     * Returns client's id.
     *
     * @returns {string} client connection identifier
     */
    getClientId(): string;
}

export interface IBackend {
    install(): void;

    uninstall(): void;

    stubRequest(method: string, urlOrRegExp: string | RegExp, response: IBackendResponse): void;

    stubOnce(method: string, orlOrRegExp: string | RegExp, response: IBackendResponse): Promise<any>;

    stubFailure(method: string, orlOrRegExp: string | RegExp, response: IBackendResponse): Promise<any>;

    stubTimeout(urlOrRegExp: string | RegExp): void;

    wait(fn: Function): Promise<any>;

    wait(delay: number, fn: Function): Promise<any>;
}

export interface IBackendResponse {
    status?: number;
    response?: any;
    responseText?: string;
}

export interface IRestAPIConfig {
    baseUrl?: string;
    headers?: any;
}

export interface IRemoteAPI {
    getAll<T>(): Promise<T[]>;

    getAllByNamespace<T>(namespace: string): Promise<T[]>;

    getById<T>(workspaceKey: string): Promise<T>;

    create(config: IWorkspaceConfig, params: IResourceCreateQueryParams): Promise<any>;

    update(workspaceId: string, workspace: IWorkspace): Promise<any>;

    delete(workspaceId: string): Promise<any>;

    start(workspaceId: string, environmentName: string): Promise<any>;

    startTemporary(config: IWorkspaceConfig): Promise<any>;

    stop(workspaceId: string): Promise<any>;

    getSettings<T>(): Promise<T>;
}

export interface IRequestError extends Error {
    status?: number;
    config: any;
    request?: any;
    response?: IResponse<any>;
}

export interface IResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
}

export interface IResourceCreateQueryParams extends IResourceQueryParams {
    attribute: string;
    namespace?: string;
}

export interface IResourceQueryParams {
    [propName: string]: string | any;
}
