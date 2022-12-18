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
exports.JsonRpcApiClient = void 0;
var json_rpc_client_1 = require("./json-rpc-client");
/**
 * Class for basic CHE API communication methods.
 *
 * @author Ann Shumilova
 */
var JsonRpcApiClient = /** @class */ (function () {
    function JsonRpcApiClient(client) {
        this.client = client;
        this.jsonRpcClient = new json_rpc_client_1.JsonRpcClient(client);
    }
    /**
     * Subscribe on the events from service.
     *
     * @param event event's name to subscribe
     * @param notification notification name to handle
     * @param handler event's handler
     * @param params params (optional)
     */
    JsonRpcApiClient.prototype.subscribe = function (event, notification, handler, params) {
        this.jsonRpcClient.addNotificationHandler(notification, handler);
        this.jsonRpcClient.notify(event, params);
    };
    /**
     * Unsubscribe concrete handler from events from service.
     *
     * @param event event's name to unsubscribe
     * @param notification notification name bound to the event
     * @param handler handler to be removed
     * @param params params (optional)
     */
    JsonRpcApiClient.prototype.unsubscribe = function (event, notification, handler, params) {
        this.jsonRpcClient.removeNotificationHandler(notification, handler);
        this.jsonRpcClient.notify(event, params);
    };
    /**
     * Connects to the pointed entrypoint
     *
     * @param entrypoint entrypoint to connect to
     * @returns {Promise<any>} promise
     */
    JsonRpcApiClient.prototype.connect = function (entrypoint) {
        return this.client.connect(entrypoint);
    };
    /**
     * Makes request.
     *
     * @param method
     * @param params
     * @returns {Promise<any>}
     */
    JsonRpcApiClient.prototype.request = function (method, params) {
        return this.jsonRpcClient.request(method, params);
    };
    return JsonRpcApiClient;
}());
exports.JsonRpcApiClient = JsonRpcApiClient;
