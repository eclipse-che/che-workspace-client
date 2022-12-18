/*
 * Copyright (c) 2018-2021 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */
// / <reference path="../../typings/websocket.d.ts" />

import { Deferred } from '../utils/deferred';

import websocket = require('websocket');

export interface IClientEventHandler {
  (...args: any[]): void;
}

export type ClientEventType = 'close' | 'error' | 'open' | 'response';

export interface IRequest {
  jsonrpc: string;
  id: string;
  method: string;
  params: any;
}

export interface IResponse {
  jsonrpc: string;
  id: string;
  result?: any;
  error?: IError;
}

export interface INotification {
  jsonrpc: string;
  method: string;
  params: any;
}

export interface IError {
  number: number;
  message: string;
  data?: any;
}

/**
 * Interface for communication between two entryPoints.
 * The implementation can be through websocket or http protocol.
 */
export interface ICommunicationClient {
  /**
   * Performs connections.
   *
   * @param entryPoint
   */
  connect(entryPoint: string): Promise<any>;
  /**
   * Close the connection.
   */
  disconnect(): void;
  /**
   * Adds listener on client event.
   */
  addListener(event: ClientEventType, handler: IClientEventHandler): void;
  /**
   * Removes listener.
   *
   * @param {ClientEventType} event
   * @param {Function} handler
   */
  removeListener(event: ClientEventType, handler: IClientEventHandler): void;
  /**
   * Send pointed data.
   *
   * @param data data to be sent
   */
  send(data: IRequest | INotification): void;
}

/**
 * The implementation for JSON RPC protocol communication through websocket.
 *
 * @author Ann Shumilova
 */
export class WebSocketClient implements ICommunicationClient {
  public websocketStream: any;

  private handlers: { [clientEventType: string]: IClientEventHandler[] };

  constructor() {
    this.handlers = {};
  }

  /**
   * Performs connection to the pointed entrypoint.
   *
   * @param entryPoint the entrypoint to connect to
   * @returns {Promise<any>}
   */
  connect(entryPoint: string): Promise<any> {
    const deferred = new Deferred();
    const W3CWebSocket = websocket.w3cwebsocket;
    this.websocketStream = new W3CWebSocket(entryPoint);

    this.websocketStream.onerror = () => {
      deferred.reject();

      const event: ClientEventType = 'error';
      if (!this.handlers[event] || this.handlers[event].length === 0) {
        return;
      }

      this.handlers[event].forEach((handler: IClientEventHandler) => handler());
    };

    this.websocketStream.onopen = () => {
      deferred.resolve();

      const event: ClientEventType = 'open';
      if (!this.handlers[event] || this.handlers[event].length === 0) {
        return;
      }

      this.handlers[event].forEach((handler: IClientEventHandler) => handler());
    };

    this.websocketStream.onclose = () => {
      const event: ClientEventType = 'close';
      if (!this.handlers[event] || this.handlers[event].length === 0) {
        return;
      }

      this.handlers[event].forEach((handler: IClientEventHandler) => handler());
    };

    this.websocketStream.onmessage = (message: any) => {
      const data = JSON.parse(message.data);

      const event: ClientEventType = 'response';
      if (!this.handlers[event] || this.handlers[event].length === 0) {
        return;
      }

      this.handlers[event].forEach((handler: IClientEventHandler) => handler(data));
    };

    return deferred.promise;
  }

  /**
   * Performs closing the connection.
   */
  disconnect(): void {
    if (this.websocketStream) {
      this.websocketStream.close();
    }
  }

  /**
   * Sends pointed data.
   *
   * @param data to be sent
   */
  send(data: IRequest | INotification): void {
    this.websocketStream.send(JSON.stringify(data));
  }

  /**
   * Adds a listener on an event.
   *
   * @param {ClientEventType} event
   * @param {IClientEventHandler} handler
   */
  addListener(event: ClientEventType, handler: IClientEventHandler): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  /**
   * Removes a listener.
   *
   * @param {ClientEventType} event
   * @param {IClientEventHandler} handler
   */
  removeListener(event: ClientEventType, handler: IClientEventHandler): void {
    if (!this.handlers[event] || !handler) {
      return;
    }
    const index = this.handlers[event].indexOf(handler);
    if (index === -1) {
      return;
    }
    this.handlers[event].splice(index, 1);
  }
}
