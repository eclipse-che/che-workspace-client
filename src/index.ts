/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import axios, {AxiosInstance, AxiosStatic} from 'axios';
import { httpsOverHttp } from 'tunnel';
import {IRemoteAPI, RemoteAPI} from './rest/remote-api';
import {Resources} from './rest/resources';
import {IWorkspaceMasterApi, WorkspaceMasterApi} from './json-rpc/workspace-master-api';
import {WebSocketClient} from './json-rpc/web-socket-client';
import * as fs from 'fs';
import * as https from 'https';
import * as url from 'url';

export * from './rest/remote-api';
export * from './json-rpc/workspace-master-api';

export  interface IRestAPIConfig {
    baseUrl?: string;
    headers?: any;
    // path to self signed certificate
    ssCrtPath?: string;
}

export default class WorkspaceClient {

    public static getRestApi(config: IRestAPIConfig = {}): IRemoteAPI {
        let baseUrl = config.baseUrl;
        if (!baseUrl) {
            baseUrl = '/api';
        }
        const lastChar = baseUrl.slice(-1);
        if (lastChar === '/') {
            baseUrl = baseUrl.substr(0, baseUrl.length - 1);
        }

        const headers = config.headers || {};

        const resources = new Resources(this.createAxiosInstance(config), baseUrl, headers);
        return new RemoteAPI(resources);
    }

    public static getJsonRpcApi(entryPoint: string): IWorkspaceMasterApi {
        const transport = new WebSocketClient();
        return new WorkspaceMasterApi(transport, entryPoint);
    }

    private static createAxiosInstance(config: IRestAPIConfig): AxiosInstance {
        if (config.ssCrtPath && this.isItNode() && fs.existsSync(config.ssCrtPath)) {
            const proxy = process.env.http_proxy;
            let agent;
            if (proxy && proxy !== '' && config.baseUrl && config.baseUrl.startsWith('https://')) {
                const pacedUrl = url.parse(proxy);
                if (pacedUrl.host && pacedUrl.port) {
                    agent = httpsOverHttp({
                        proxy: {
                            host: pacedUrl.host,
                            port: Number(pacedUrl.port)
                        },
                        ca: [fs.readFileSync(config.ssCrtPath)]
                    });
                }
            } else {
                agent = new https.Agent({
                    ca: fs.readFileSync(config.ssCrtPath)
                });
            }
            return axios.create({httpsAgent: agent});
        }

        return axios;
    }

    private static isItNode() {
        return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined');
    }
}
