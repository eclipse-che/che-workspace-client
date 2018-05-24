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

import axios, {AxiosInstance} from 'axios';
import moxios from 'moxios';
import {IRemoteAPI, RemoteAPI} from './rest/remote-api';
import {Resources} from './rest/resources';
import {Backend, IBackend} from './rest/backend';
import {IWorkspaceMasterApi, WorkspaceMasterApi} from './json-rpc/workspace-master-api';
import {WebSocketClient} from './json-rpc/web-socket-client';

interface IRestAPIConfig {
    baseUrl?: string;
    headers?: any;
}

export default class WorkspaceClient {

    private static axiosInstance: AxiosInstance = axios;

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

        const resources = new Resources(this.axiosInstance, baseUrl, headers);
        return new RemoteAPI(resources);
    }

    public static getRestBackend(): IBackend {
        return new Backend(this.axiosInstance, moxios);
    }

    public static getJsonRpcApi(entryPoint: string): IWorkspaceMasterApi {
        const transport = new WebSocketClient();
        return new WorkspaceMasterApi(transport, entryPoint);
    }

}
