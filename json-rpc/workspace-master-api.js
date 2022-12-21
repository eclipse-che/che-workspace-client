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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceMasterApi = void 0;
var json_rpc_api_client_1 = require("./json-rpc-api-client");
var events_1 = require("events");
var MasterScopes;
(function (MasterScopes) {
    MasterScopes["ORGANIZATION"] = "organizationId";
    MasterScopes["USER"] = "userId";
    MasterScopes["WORKSPACE"] = "workspaceId";
})(MasterScopes || (MasterScopes = {}));
var SUBSCRIBE = 'subscribe';
var UNSUBSCRIBE = 'unSubscribe';
/**
 * Client API for workspace master interactions.
 *
 * @author Ann Shumilova
 */
var WorkspaceMasterApi = /** @class */ (function () {
    function WorkspaceMasterApi(client, entryPoint, refreshToken) {
        var _this = this;
        this.webSocketStatusChangeEventName = 'websocketChanged';
        this.maxReconnectionAttempts = 30;
        this.reconnectionAttemptNumber = 0;
        this.reconnectionDelay = 30000;
        this.reconnectionInitialDelay = 1000;
        this.websocketContext = '/api/websocket';
        client.addListener('open', function () { return _this.onConnectionOpen(); });
        client.addListener('close', function () { return _this.onConnectionClose(); });
        this.clientId = '';
        this.jsonRpcApiClient = new json_rpc_api_client_1.JsonRpcApiClient(client);
        this.wsMasterEventEmitter = new events_1.EventEmitter();
        this.failingWebsockets = new Set();
        this.entryPoint = entryPoint;
        this.refreshToken = refreshToken;
    }
    WorkspaceMasterApi.prototype.onDidWebSocketStatusChange = function (callback) {
        this.wsMasterEventEmitter.on(this.webSocketStatusChangeEventName, callback);
    };
    /**
     * Opens connection to pointed entryPoint.
     *
     * @returns {Promise<any>}
     */
    WorkspaceMasterApi.prototype.connect = function () {
        var _this = this;
        if (this.refreshToken) {
            return this.refreshToken().then(function (newToken) {
                var params = ["token=" + newToken];
                if (_this.clientId) {
                    params.push("clientId=" + _this.clientId);
                }
                var entrypoint = _this.entryPoint + _this.websocketContext;
                var queryStr = params.join('&');
                if (/\?/.test(entrypoint) === false) {
                    entrypoint = entrypoint + '?' + queryStr;
                }
                else {
                    entrypoint = entrypoint + '&' + queryStr;
                }
                return _this.jsonRpcApiClient.connect(entrypoint).then(function () {
                    return _this.fetchClientId();
                });
            });
        }
        return Promise.resolve(undefined);
    };
    /**
     * Subscribes the environment output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    WorkspaceMasterApi.prototype.subscribeEnvironmentOutput = function (workspaceId, callback) {
        this.subscribe("runtime/log" /* ENVIRONMENT_OUTPUT */, MasterScopes.WORKSPACE, workspaceId, callback);
    };
    /**
     * Un-subscribes the pointed callback from the environment output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    WorkspaceMasterApi.prototype.unSubscribeEnvironmentOutput = function (workspaceId, callback) {
        this.unsubscribe("runtime/log" /* ENVIRONMENT_OUTPUT */, MasterScopes.WORKSPACE, workspaceId, callback);
    };
    /**
     * Subscribes to workspace's status.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    WorkspaceMasterApi.prototype.subscribeWorkspaceStatus = function (workspaceId, callback) {
        var statusHandler = function (message) {
            if (workspaceId === message.workspaceId) {
                callback(message);
            }
        };
        this.subscribe("workspace/statusChanged" /* WORKSPACE_STATUS */, MasterScopes.WORKSPACE, workspaceId, statusHandler);
    };
    /**
     * Un-subscribes pointed callback from workspace's status.
     *
     * @param workspaceId
     * @param callback
     */
    WorkspaceMasterApi.prototype.unSubscribeWorkspaceStatus = function (workspaceId, callback) {
        this.unsubscribe("workspace/statusChanged" /* WORKSPACE_STATUS */, MasterScopes.WORKSPACE, workspaceId, callback);
    };
    /**
     * Subscribe to organization statuses.
     *
     * @param {string} organizationId organization's id
     * @param {IClientEventHandler} callback handler
     */
    WorkspaceMasterApi.prototype.subscribeOrganizationStatus = function (organizationId, callback) {
        this.subscribe("organization/statusChanged" /* ORGANIZATION_STATUS */, MasterScopes.ORGANIZATION, organizationId, callback);
    };
    /**
     * Un-subscribe from organization status changes.
     *
     * @param {string} organizationId organization's id
     * @param {IClientEventHandler} callback handler
     */
    WorkspaceMasterApi.prototype.unSubscribeOrganizationStatus = function (organizationId, callback) {
        this.unsubscribe("organization/statusChanged" /* ORGANIZATION_STATUS */, MasterScopes.ORGANIZATION, organizationId, callback);
    };
    /**
     * Subscribe to organization membership changes.
     *
     * @param {string} userId user's id to track changes
     * @param {IClientEventHandler} callback handler
     */
    WorkspaceMasterApi.prototype.subscribeOrganizationMembershipStatus = function (userId, callback) {
        this.subscribe("organization/membershipChanged" /* ORGANIZATION_MEMBERSHIP_STATUS */, MasterScopes.USER, userId, callback);
    };
    /**
     * Un-subscribe from organization membership changes.
     *
     * @param {string} userId user's id to untrack changes
     * @param {IClientEventHandler} callback handler
     */
    WorkspaceMasterApi.prototype.unSubscribeOrganizationMembershipStatus = function (userId, callback) {
        this.unsubscribe("organization/membershipChanged" /* ORGANIZATION_MEMBERSHIP_STATUS */, MasterScopes.USER, userId, callback);
    };
    /**
     * Fetch client's id and stores it.
     *
     * @returns {Promise<any>}
     */
    WorkspaceMasterApi.prototype.fetchClientId = function () {
        var _this = this;
        return this.jsonRpcApiClient.request('websocketIdService/getId').then(function (data) {
            _this.clientId = data[0];
        });
    };
    /**
     * Returns client's id.
     *
     * @returns {string} client connection identifier
     */
    WorkspaceMasterApi.prototype.getClientId = function () {
        return this.clientId;
    };
    WorkspaceMasterApi.prototype.onConnectionOpen = function () {
        if (this.reconnectionAttemptNumber !== 0) {
            this.failingWebsockets.delete(this.entryPoint);
            this.wsMasterEventEmitter.emit(this.webSocketStatusChangeEventName, this.failingWebsockets);
            console.warn('WebSocket connection is opened.');
        }
        this.reconnectionAttemptNumber = 0;
    };
    WorkspaceMasterApi.prototype.onConnectionClose = function () {
        var _this = this;
        console.warn('WebSocket connection is closed.');
        if (this.reconnectionAttemptNumber === 5) {
            this.failingWebsockets.add(this.entryPoint);
            this.wsMasterEventEmitter.emit(this.webSocketStatusChangeEventName, this.failingWebsockets);
        }
        else if (this.reconnectionAttemptNumber === this.maxReconnectionAttempts) {
            console.warn('The maximum number of attempts to reconnect WebSocket has been reached.');
            return;
        }
        this.reconnectionAttemptNumber++;
        var delay;
        if (this.reconnectionAttemptNumber === 1) {
            // let very first reconnection happens immediately after the connection is closed.
            delay = 0;
        }
        else if (this.reconnectionAttemptNumber <= 10) {
            delay = this.reconnectionInitialDelay;
        }
        else {
            delay = this.reconnectionDelay;
        }
        if (delay) {
            console.warn("WebSocket will be reconnected in " + delay + " ms...");
        }
        setTimeout(function () {
            console.warn("WebSocket is reconnecting, attempt #" + _this.reconnectionAttemptNumber + " out of " + _this.maxReconnectionAttempts + "...");
            _this.connect();
        }, delay);
    };
    /**
     * Performs subscribe to the pointed channel for pointed workspace's ID and callback.
     *
     * @param channel channel to un-subscribe
     * @param _scope the scope of the request
     * @param id instance's id (scope value)
     * @param callback callback
     */
    WorkspaceMasterApi.prototype.subscribe = function (channel, _scope, id, callback) {
        var method = channel;
        var masterScope = _scope;
        var params = { method: method, scope: {} };
        params.scope[masterScope] = id;
        this.jsonRpcApiClient.subscribe(SUBSCRIBE, method, callback, params);
    };
    /**
     * Performs un-subscribe of the pointed channel by pointed workspace's ID and callback.
     *
     * @param channel channel to un-subscribe
     * @param _scope the scope of the request
     * @param id instance's id (scope value)
     * @param callback callback
     */
    WorkspaceMasterApi.prototype.unsubscribe = function (channel, _scope, id, callback) {
        var method = channel;
        var masterScope = _scope;
        var params = { method: method, scope: {} };
        params.scope[masterScope] = id;
        this.jsonRpcApiClient.unsubscribe(UNSUBSCRIBE, method, callback, params);
    };
    return WorkspaceMasterApi;
}());
exports.WorkspaceMasterApi = WorkspaceMasterApi;
