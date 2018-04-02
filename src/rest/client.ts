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

import axios from 'axios';
import moxios from 'moxios';
import { Backend, IBackend } from './backend';
import { Resources } from './resources';
import { IRemoteAPI, RemoteAPI } from './remote-api';

export namespace Rest {

    const axiosInstance = axios;

    export function getBackend(): IBackend {
        const backend = new Backend(axiosInstance, moxios);
        return backend;
    }

    export type restAPIConfig = {
        baseUrl?: string;
        headers?: any;
    };

    export function getRestApi(config: restAPIConfig = {}): IRemoteAPI {

        let baseUrl = config.baseUrl;
        if (!baseUrl) {
            baseUrl = '/api';
        }
        const lastChar = baseUrl.slice(-1);
        if (lastChar === '/') {
            baseUrl = baseUrl.substr(-1);
        }

        const headers = config.headers || {};

        const resources = new Resources(axiosInstance, baseUrl, headers);
        return new RemoteAPI(resources);
    }

}
