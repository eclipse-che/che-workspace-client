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
exports.JsonRpcClient = void 0;
var deferred_1 = require("../utils/deferred");
var JSON_RPC_VERSION = '2.0';
/**
 * This client is handling the JSON RPC requests, responses and notifications.
 *
 * @author Ann Shumilova
 */
var JsonRpcClient = /** @class */ (function () {
    function JsonRpcClient(client) {
        var _this = this;
        this.counter = 100;
        this.client = client;
        this.pendingRequests = new Map();
        this.notificationHandlers = new Map();
        this.client.addListener('response', function (message) {
            _this.processResponse(message);
        });
    }
    /**
     * Performs JSON RPC request.
     *
     * @param method method's name
     * @param params params
     * @returns {Promise<any>}
     */
    JsonRpcClient.prototype.request = function (method, params) {
        var deferred = new deferred_1.Deferred();
        var id = (this.counter++).toString();
        this.pendingRequests.set(id, deferred);
        var request = {
            jsonrpc: JSON_RPC_VERSION,
            id: id,
            method: method,
            params: params
        };
        this.client.send(request);
        return deferred.promise;
    };
    /**
     * Sends JSON RPC notification.
     *
     * @param method method's name
     * @param params params (optional)
     */
    JsonRpcClient.prototype.notify = function (method, params) {
        var request = {
            jsonrpc: JSON_RPC_VERSION,
            method: method,
            params: params
        };
        this.client.send(request);
    };
    /**
     * Adds notification handler.
     *
     * @param method method's name
     * @param handler handler to process notification
     */
    JsonRpcClient.prototype.addNotificationHandler = function (method, handler) {
        var handlers = this.notificationHandlers.get(method);
        if (handlers) {
            handlers.push(handler);
        }
        else {
            handlers = [handler];
            this.notificationHandlers.set(method, handlers);
        }
    };
    /**
     * Removes notification handler.
     *
     * @param method method's name
     * @param handler handler
     */
    JsonRpcClient.prototype.removeNotificationHandler = function (method, handler) {
        var handlers = this.notificationHandlers.get(method);
        if (handlers && handler) {
            handlers.splice(handlers.indexOf(handler), 1);
        }
    };
    /**
     * Processes response - detects whether it is JSON RPC response or notification.
     *
     * @param message
     */
    JsonRpcClient.prototype.processResponse = function (message) {
        if (this.isResponse(message)) {
            this.processResponseMessage(message);
        }
        else {
            this.processNotification(message);
        }
    };
    /**
     * Processes JSON RPC notification.
     *
     * @param message message
     */
    JsonRpcClient.prototype.processNotification = function (message) {
        var method = message.method;
        var handlers = this.notificationHandlers.get(method);
        if (handlers && handlers.length > 0) {
            handlers.forEach(function (handler) {
                handler(message.params);
            });
        }
    };
    /**
     * Process JSON RPC response.
     *
     * @param message
     */
    JsonRpcClient.prototype.processResponseMessage = function (message) {
        var promise = this.pendingRequests.get(message.id);
        if (!promise) {
            return;
        }
        if (message.result) {
            promise.resolve(message.result);
            return;
        }
        if (message.error) {
            promise.reject(message.error);
        }
    };
    JsonRpcClient.prototype.isResponse = function (message) {
        return message.id !== undefined && this.pendingRequests.has(message.id);
    };
    return JsonRpcClient;
}());
exports.JsonRpcClient = JsonRpcClient;
