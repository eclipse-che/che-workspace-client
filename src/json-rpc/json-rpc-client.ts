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

import {IClientEventHandler, ICommunicationClient, INotification, IRequest, IResponse} from './web-socket-client';
import {Deferred, IDeferred} from '../utils/deferred';

const JSON_RPC_VERSION: string = '2.0';

/**
 * This client is handling the JSON RPC requests, responses and notifications.
 *
 * @author Ann Shumilova
 */
export class JsonRpcClient {
    /**
     * Client for performing communications.
     */
    private client: ICommunicationClient;
    /**
     * The list of the pending requests by request id.
     */
    private pendingRequests: Map<string, IDeferred<any>>;
    /**
     * The list of notification handlers by method name.
     */
    private notificationHandlers: Map<string, Array<IClientEventHandler>>;
    private counter: number = 100;

    constructor (client: ICommunicationClient) {
        this.client = client;
        this.pendingRequests = new Map<string, IDeferred<any>>();
        this.notificationHandlers = new Map<string, Array<IClientEventHandler>>();

        this.client.addListener('response', (message: any) => {
            this.processResponse(message);
        });
    }

    /**
     * Performs JSON RPC request.
     *
     * @param method method's name
     * @param params params
     * @returns {Promise<any>}
     */
    request(method: string, params?: any): Promise<any> {
        let deferred = new Deferred();
        let id: string = (this.counter++).toString();
        this.pendingRequests.set(id, deferred);

        let request: IRequest = {
            jsonrpc: JSON_RPC_VERSION,
            id: id,
            method: method,
            params: params
        };

        this.client.send(request);
        return deferred.promise;
    }

    /**
     * Sends JSON RPC notification.
     *
     * @param method method's name
     * @param params params (optional)
     */
    notify(method: string, params?: any): void {
        let request: INotification = {
            jsonrpc: JSON_RPC_VERSION,
            method: method,
            params: params
        };
        this.client.send(request);
    }

    /**
     * Adds notification handler.
     *
     * @param method method's name
     * @param handler handler to process notification
     */
    public addNotificationHandler(method: string, handler: IClientEventHandler): void {
        let handlers = this.notificationHandlers.get(method);

        if (handlers) {
            handlers.push(handler);
        } else {
            handlers = [handler];
            this.notificationHandlers.set(method, handlers);
        }
    }

    /**
     * Removes notification handler.
     *
     * @param method method's name
     * @param handler handler
     */
    public removeNotificationHandler(method: string, handler: IClientEventHandler): void {
        let handlers = this.notificationHandlers.get(method);

        if (handlers && handler) {
            handlers.splice(handlers.indexOf(handler), 1);
        }
    }

    /**
     * Processes response - detects whether it is JSON RPC response or notification.
     *
     * @param message
     */
    private processResponse(message: IResponse | INotification): void {
        if (this.isResponse(message)) {
            this.processResponseMessage(message);
        } else {
            this.processNotification(message as INotification);
        }
    }

    /**
     * Processes JSON RPC notification.
     *
     * @param message message
     */
    private processNotification(message: INotification): void {
        let method = message.method;
        let handlers = this.notificationHandlers.get(method);
        if (handlers && handlers.length > 0) {
            handlers.forEach((handler: Function) => {
                handler(message.params);
            });
        }
    }

    /**
     * Process JSON RPC response.
     *
     * @param message
     */
    private processResponseMessage(message: IResponse): void {
        let promise = this.pendingRequests.get(message.id);
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
    }

    private isResponse(message: IResponse | INotification): message is IResponse {
        return (message as IResponse).id !== undefined && this.pendingRequests.has((message as IResponse).id);
    }

}
