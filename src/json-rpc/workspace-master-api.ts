/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
'use strict';

import {IClientEventHandler, ICommunicationClient} from './web-socket-client';
import {JsonRpcApiClient} from './json-rpc-api-client';
import {EventEmitter} from 'events';

const enum MasterChannels {
    ENVIRONMENT_OUTPUT = 'runtime/log',
    WORKSPACE_STATUS = 'workspace/statusChanged',
    ORGANIZATION_STATUS = 'organization/statusChanged',
    ORGANIZATION_MEMBERSHIP_STATUS = 'organization/membershipChanged'
}

enum MasterScopes {
    ORGANIZATION = 'organizationId',
    USER = 'userId',
    WORKSPACE = 'workspaceId'
}

const SUBSCRIBE = 'subscribe';
const UNSUBSCRIBE = 'unSubscribe';

export type WebSocketsStatusChangeCallback = (failingWebSockets: string[]) => void;
export type RefreshToken = () => Promise<string | Error>;

export interface IWorkspaceMasterApi {
    onDidWebSocketStatusChange(callback: WebSocketsStatusChangeCallback): void;
    connect(): Promise<any>;
    subscribeEnvironmentOutput(workspaceId: string, callback: Function): void;
    unSubscribeEnvironmentOutput(workspaceId: string, callback: Function): void;
    subscribeWorkspaceStatus(workspaceId: string, callback: Function): void;
    unSubscribeWorkspaceStatus(workspaceId: string, callback: Function): void;
    subscribeOrganizationStatus(organizationId: string, callback: Function): void;
    unSubscribeOrganizationStatus(organizationId: string, callback: Function): void;
    subscribeOrganizationMembershipStatus(userId: string, callback: Function): void;
    unSubscribeOrganizationMembershipStatus(userId: string, callback: Function): void;
    fetchClientId(): Promise<any>;
    getClientId(): string;
}

/**
 * Client API for workspace master interactions.
 *
 * @author Ann Shumilova
 */
export class WorkspaceMasterApi implements IWorkspaceMasterApi {

    private refreshToken?: RefreshToken;
    private jsonRpcApiClient: JsonRpcApiClient;
    private clientId: string;
    private wsMasterEventEmitter: EventEmitter;
    private webSocketStatusChangeEventName = 'websocketChanged';

    private maxReconnectionAttempts = 30;
    private reconnectionAttemptNumber = 0;
    private reconnectionDelay = 30000;
    private reconnectionInitialDelay = 1000;
    private failingWebsockets: Set<string>;
    private websocketContext = '/api/websocket';
    private entryPoint: string;

    constructor (client: ICommunicationClient,
                 entryPoint: string,
                 refreshToken?: RefreshToken) {
        client.addListener('open', () => this.onConnectionOpen());
        client.addListener('close', () => this.onConnectionClose());

        this.clientId = '';
        this.jsonRpcApiClient = new JsonRpcApiClient(client);
        this.wsMasterEventEmitter = new EventEmitter();
        this.failingWebsockets = new Set();
        this.entryPoint = entryPoint;
        this.refreshToken = refreshToken;
    }

    onDidWebSocketStatusChange(callback: WebSocketsStatusChangeCallback): void {
        this.wsMasterEventEmitter.on(this.webSocketStatusChangeEventName, callback);
    }

    /**
     * Opens connection to pointed entryPoint.
     *
     * @returns {Promise<any>}
     */
    connect(): Promise<any> {
        if (this.refreshToken) {
            return this.refreshToken().then((newToken) => {
                const params: string[] = [`token=${newToken}`];

                if (this.clientId) {
                    params.push(`clientId=${this.clientId}`);
                }

                let entrypoint = this.entryPoint + this.websocketContext;
                const queryStr = params.join('&');
                if (/\?/.test(entrypoint) === false) {
                    entrypoint = entrypoint + '?' + queryStr;
                } else {
                    entrypoint = entrypoint + '&' + queryStr;
                }
                return this.jsonRpcApiClient.connect(entrypoint).then(() => {
                    return this.fetchClientId();
                });
            });
        }
        return Promise.resolve(undefined);
    }

    /**
     * Subscribes the environment output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeEnvironmentOutput(workspaceId: string, callback: IClientEventHandler): void {
        this.subscribe(MasterChannels.ENVIRONMENT_OUTPUT, MasterScopes.WORKSPACE, workspaceId, callback);
    }

    /**
     * Un-subscribes the pointed callback from the environment output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeEnvironmentOutput(workspaceId: string, callback: IClientEventHandler): void {
        this.unsubscribe(MasterChannels.ENVIRONMENT_OUTPUT, MasterScopes.WORKSPACE, workspaceId, callback);
    }

    /**
     * Subscribes to workspace's status.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeWorkspaceStatus(workspaceId: string, callback: Function): void {
        let statusHandler = (message: any) => {
            if (workspaceId === message.workspaceId) {
                callback(message);
            }
        };
        this.subscribe(MasterChannels.WORKSPACE_STATUS, MasterScopes.WORKSPACE, workspaceId, statusHandler);
    }

    /**
     * Un-subscribes pointed callback from workspace's status.
     *
     * @param workspaceId
     * @param callback
     */
    unSubscribeWorkspaceStatus(workspaceId: string, callback: IClientEventHandler): void {
        this.unsubscribe(MasterChannels.WORKSPACE_STATUS, MasterScopes.WORKSPACE, workspaceId, callback);
    }

    /**
     * Subscribe to organization statuses.
     *
     * @param {string} organizationId organization's id
     * @param {IClientEventHandler} callback handler
     */
    subscribeOrganizationStatus(organizationId: string, callback: IClientEventHandler): void {
        this.subscribe(MasterChannels.ORGANIZATION_STATUS, MasterScopes.ORGANIZATION, organizationId, callback);
    }

    /**
     * Un-subscribe from organization status changes.
     *
     * @param {string} organizationId organization's id
     * @param {IClientEventHandler} callback handler
     */
    unSubscribeOrganizationStatus(organizationId: string, callback: IClientEventHandler): void {
        this.unsubscribe(MasterChannels.ORGANIZATION_STATUS, MasterScopes.ORGANIZATION, organizationId, callback);
    }

    /**
     * Subscribe to organization membership changes.
     *
     * @param {string} userId user's id to track changes
     * @param {IClientEventHandler} callback handler
     */
    subscribeOrganizationMembershipStatus(userId: string, callback: IClientEventHandler): void {
        this.subscribe(MasterChannels.ORGANIZATION_MEMBERSHIP_STATUS, MasterScopes.USER, userId, callback);
    }

    /**
     * Un-subscribe from organization membership changes.
     *
     * @param {string} userId user's id to untrack changes
     * @param {IClientEventHandler} callback handler
     */
    unSubscribeOrganizationMembershipStatus(userId: string, callback: IClientEventHandler): void {
        this.unsubscribe(MasterChannels.ORGANIZATION_MEMBERSHIP_STATUS, MasterScopes.USER, userId, callback);
    }

    /**
     * Fetch client's id and stores it.
     *
     * @returns {Promise<any>}
     */
    fetchClientId(): Promise<any> {
        return this.jsonRpcApiClient.request('websocketIdService/getId').then((data: any) => {
            this.clientId = data[0];
        });
    }

    /**
     * Returns client's id.
     *
     * @returns {string} client connection identifier
     */
    getClientId(): string {
        return this.clientId;
    }

    private onConnectionOpen(): void {
        if (this.reconnectionAttemptNumber !== 0) {
            this.failingWebsockets.delete(this.entryPoint);
            this.wsMasterEventEmitter.emit(this.webSocketStatusChangeEventName, this.failingWebsockets);
            console.warn('WebSocket connection is opened.');
        }
        this.reconnectionAttemptNumber = 0;
    }

    private onConnectionClose(): void {
        console.warn('WebSocket connection is closed.');
        if (this.reconnectionAttemptNumber === 5) {
            this.failingWebsockets.add(this.entryPoint);
            this.wsMasterEventEmitter.emit(this.webSocketStatusChangeEventName, this.failingWebsockets);
        } else if (this.reconnectionAttemptNumber === this.maxReconnectionAttempts) {
            console.warn('The maximum number of attempts to reconnect WebSocket has been reached.');
            return;
        }

        this.reconnectionAttemptNumber++;
        let delay: number;
        if (this.reconnectionAttemptNumber === 1) {
            // let very first reconnection happens immediately after the connection is closed.
            delay = 0;
        } else if (this.reconnectionAttemptNumber <= 10) {
            delay = this.reconnectionInitialDelay;
        } else {
            delay = this.reconnectionDelay;
        }

        if (delay) {
            console.warn(`WebSocket will be reconnected in ${delay} ms...`);
        }
        setTimeout(() => {
            console.warn(`WebSocket is reconnecting, attempt #${this.reconnectionAttemptNumber} out of ${this.maxReconnectionAttempts}...`);
            this.connect();
        }, delay);
    }

    /**
     * Performs subscribe to the pointed channel for pointed workspace's ID and callback.
     *
     * @param channel channel to un-subscribe
     * @param _scope the scope of the request
     * @param id instance's id (scope value)
     * @param callback callback
     */
    private subscribe(channel: MasterChannels, _scope: MasterScopes, id: string, callback: IClientEventHandler): void {
        const method = channel;
        const masterScope: string = _scope;
        const params: any = {method: method, scope: {}};
        params.scope[masterScope] = id;
        this.jsonRpcApiClient.subscribe(SUBSCRIBE, method, callback, params);
    }

    /**
     * Performs un-subscribe of the pointed channel by pointed workspace's ID and callback.
     *
     * @param channel channel to un-subscribe
     * @param _scope the scope of the request
     * @param id instance's id (scope value)
     * @param callback callback
     */
    private unsubscribe(channel: MasterChannels, _scope: MasterScopes, id: string, callback: IClientEventHandler): void {
        const method: string = channel;
        const masterScope: string = _scope;
        const params: any = {method: method, scope: {}};
        params.scope[masterScope] = id;
        this.jsonRpcApiClient.unsubscribe(UNSUBSCRIBE, method, callback, params);
    }
}
