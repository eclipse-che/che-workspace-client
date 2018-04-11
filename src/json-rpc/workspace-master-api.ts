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
'use strict';

import {IClientEventHandler, ICommunicationClient} from './web-socket-client';
import {JsonRpcApiClient} from './json-rpc-api-client';

const enum MasterChannels {
    ENVIRONMENT_OUTPUT = 'machine/log',
    ENVIRONMENT_STATUS = 'machine/statusChanged',
    WS_AGENT_OUTPUT = 'installer/log',
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
const UNSUBSCRIBE = 'unsubscribe';

export interface IWorkspaceMasterApi {
    connect(entryPoint: string): Promise<any>;
    subscribeEnvironmentOutput(workspaceId: string, callback: Function): void;
    unSubscribeEnvironmentOutput(workspaceId: string, callback: Function): void;
    subscribeEnvironmentStatus(workspaceId: string, callback: Function): void;
    unSubscribeEnvironmentStatus(workspaceId: string, callback: Function): void;
    subscribeWsAgentOutput(workspaceId: string, callback: Function): void;
    unSubscribeWsAgentOutput(workspaceId: string, callback: Function): void;
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
    private jsonRpcApiClient: JsonRpcApiClient;
    private clientId: string;

    private maxReconnectionAttempts = 5;
    private reconnectionAttemptNumber = 0;
    private reconnectionDelay = 30000;

    constructor (client: ICommunicationClient,
                 entryPoint: string) {
        client.addListener('open', () => this.onConnectionOpen());
        client.addListener('close', () => this.onConnectionClose(entryPoint));

        this.clientId = '';
        this.jsonRpcApiClient = new JsonRpcApiClient(client);
    }

    /**
     * Opens connection to pointed entryPoint.
     *
     * @param entryPoint
     * @returns {Promise<any>}
     */
    connect(entryPoint: string): Promise<any> {
        if (this.clientId) {
            let clientId = `clientId=${this.clientId}`;
            // in case of reconnection
            // we need to test entryPoint on existing query parameters
            // to add already gotten clientId
            if (/\?/.test(entryPoint) === false) {
                clientId = '?' + clientId;
            } else {
                clientId = '&' + clientId;
            }
            entryPoint += clientId;
        }
        return this.jsonRpcApiClient.connect(entryPoint).then(() => {
            return this.fetchClientId();
        });
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
     * Subscribes the environment status changed.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeEnvironmentStatus(workspaceId: string, callback: IClientEventHandler): void {
        this.subscribe(MasterChannels.ENVIRONMENT_STATUS, MasterScopes.WORKSPACE, workspaceId, callback);
    }

    /**
     * Un-subscribes the pointed callback from environment status changed.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeEnvironmentStatus(workspaceId: string, callback: IClientEventHandler): void {
        this.unsubscribe(MasterChannels.ENVIRONMENT_STATUS, MasterScopes.WORKSPACE, workspaceId, callback);
    }

    /**
     * Subscribes on workspace agent output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeWsAgentOutput(workspaceId: string, callback: IClientEventHandler): void {
        this.subscribe(MasterChannels.WS_AGENT_OUTPUT, MasterScopes.WORKSPACE, workspaceId, callback);
    }

    /**
     * Un-subscribes from workspace agent output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeWsAgentOutput(workspaceId: string, callback: IClientEventHandler): void {
        this.unsubscribe(MasterChannels.WS_AGENT_OUTPUT, MasterScopes.WORKSPACE, workspaceId, callback);
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
            console.warn('WebSocket connection is opened.');
        }
        this.reconnectionAttemptNumber = 0;
    }

    private onConnectionClose(entryPoint: string): void {
        console.warn('WebSocket connection is closed.');
        if (this.reconnectionAttemptNumber === this.maxReconnectionAttempts) {
            console.warn('The maximum number of attempts to reconnect WebSocket has been reached.');
            return;
        }

        this.reconnectionAttemptNumber++;
        // let very first reconnection happens immediately after the connection is closed.
        const delay = this.reconnectionAttemptNumber === 1 ? 0 : this.reconnectionDelay;

        if (delay) {
            console.warn(`WebSocket will be reconnected in ${delay} ms...`);
        }
        setTimeout(() => {
            console.warn(`WebSocket is reconnecting, attempt #${this.reconnectionAttemptNumber} out of ${this.maxReconnectionAttempts}...`);
            this.connect(entryPoint);
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
