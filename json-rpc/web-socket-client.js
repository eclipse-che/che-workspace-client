/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
/// <reference path="../../typings/websocket.d.ts" />
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = void 0;
var deferred_1 = require("../utils/deferred");
var websocket = require("websocket");
/**
 * The implementation for JSON RPC protocol communication through websocket.
 *
 * @author Ann Shumilova
 */
var WebSocketClient = /** @class */ (function () {
    function WebSocketClient() {
        this.handlers = {};
    }
    /**
     * Performs connection to the pointed entrypoint.
     *
     * @param entryPoint the entrypoint to connect to
     * @returns {Promise<any>}
     */
    WebSocketClient.prototype.connect = function (entryPoint) {
        var _this = this;
        var deferred = new deferred_1.Deferred();
        var W3CWebSocket = websocket.w3cwebsocket;
        this.websocketStream = new W3CWebSocket(entryPoint);
        this.websocketStream.onerror = function () {
            deferred.reject();
            var event = 'error';
            if (!_this.handlers[event] || _this.handlers[event].length === 0) {
                return;
            }
            _this.handlers[event].forEach(function (handler) { return handler(); });
        };
        this.websocketStream.onopen = function () {
            deferred.resolve();
            var event = 'open';
            if (!_this.handlers[event] || _this.handlers[event].length === 0) {
                return;
            }
            _this.handlers[event].forEach(function (handler) { return handler(); });
        };
        this.websocketStream.onclose = function () {
            var event = 'close';
            if (!_this.handlers[event] || _this.handlers[event].length === 0) {
                return;
            }
            _this.handlers[event].forEach(function (handler) { return handler(); });
        };
        this.websocketStream.onmessage = function (message) {
            var data = JSON.parse(message.data);
            var event = 'response';
            if (!_this.handlers[event] || _this.handlers[event].length === 0) {
                return;
            }
            _this.handlers[event].forEach(function (handler) { return handler(data); });
        };
        return deferred.promise;
    };
    /**
     * Performs closing the connection.
     */
    WebSocketClient.prototype.disconnect = function () {
        if (this.websocketStream) {
            this.websocketStream.close();
        }
    };
    /**
     * Sends pointed data.
     *
     * @param data to be sent
     */
    WebSocketClient.prototype.send = function (data) {
        this.websocketStream.send(JSON.stringify(data));
    };
    /**
     * Adds a listener on an event.
     *
     * @param {ClientEventType} event
     * @param {IClientEventHandler} handler
     */
    WebSocketClient.prototype.addListener = function (event, handler) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    };
    /**
     * Removes a listener.
     *
     * @param {ClientEventType} event
     * @param {IClientEventHandler} handler
     */
    WebSocketClient.prototype.removeListener = function (event, handler) {
        if (!this.handlers[event] || !handler) {
            return;
        }
        var index = this.handlers[event].indexOf(handler);
        if (index === -1) {
            return;
        }
        this.handlers[event].splice(index, 1);
    };
    return WebSocketClient;
}());
exports.WebSocketClient = WebSocketClient;
