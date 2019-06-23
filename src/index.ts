/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import axios, {AxiosInstance} from 'axios';
import moxios from 'moxios';
import {IRemoteAPI, RemoteAPI} from './rest/remote-api';
import {Resources} from './rest/resources';
import {Backend, IBackend} from './rest/backend';
import {IWorkspaceMasterApi, WorkspaceMasterApi} from './json-rpc/workspace-master-api';
import {WebSocketClient} from './json-rpc/web-socket-client';
import * as fs from 'fs';
import * as https from 'https';

export * from './rest/backend';
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

    public static getRestBackend(): IBackend {
        return new Backend(axios, moxios);
    }

    public static getJsonRpcApi(entryPoint: string): IWorkspaceMasterApi {
        const transport = new WebSocketClient();
        return new WorkspaceMasterApi(transport, entryPoint);
    }

    private static createAxiosInstance(config: IRestAPIConfig): AxiosInstance {
        console.log('Create axios instance!!!');
        if (config.ssCrtPath && fs.existsSync(config.ssCrtPath)) {
            console.log('Detected self signed certificate!!!');
            const agent = new https.Agent({
                ca: fs.readFileSync(config.ssCrtPath)
            });
            return axios.create({httpsAgent: agent});
        }

        return axios;
    }
}
