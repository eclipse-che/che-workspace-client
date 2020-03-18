/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import axios, {AxiosInstance, AxiosStatic, AxiosRequestConfig} from 'axios';
import {IRemoteAPI, RemoteAPI} from './rest/remote-api';
import {Resources} from './rest/resources';
import {IWorkspaceMasterApi, WorkspaceMasterApi} from './json-rpc/workspace-master-api';
import {WebSocketClient} from './json-rpc/web-socket-client';
import * as fs from 'fs';
import * as https from 'https';
import * as url from 'url';
import * as tunnel from 'tunnel';

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
        if (! this.isItNode()) {
            return axios;
        }

        let certificateAuthority : Buffer | undefined;
        if (config.ssCrtPath && fs.existsSync(config.ssCrtPath)) {
            certificateAuthority = fs.readFileSync(config.ssCrtPath);
        }

        const proxyUrl = process.env.http_proxy;
        if (proxyUrl && proxyUrl !== '' && config.baseUrl) {
            let mainProxyOptions: tunnel.ProxyOptions;
            var parsedProxyUrl = url.parse(proxyUrl);
            let port = 3128;
            if (parsedProxyUrl.port && parsedProxyUrl.port !== '') {
                port = Number(parsedProxyUrl.port);
            }
            mainProxyOptions = {
                host: parsedProxyUrl.hostname!,
                port: port
            };

            if (parsedProxyUrl.auth && parsedProxyUrl.auth !== '') {
                mainProxyOptions.proxyAuth = parsedProxyUrl.auth;
            }

            const noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
            let noProxy: string[] = [];
            if (noProxyEnv) {
                noProxy = noProxyEnv.split(',').map(function trim(s: string) {
                    return s.trim();
                });
            }

            var parsedBaseUrl = url.parse(config.baseUrl);

            let shouldProxy = false;
            const hostname = parsedBaseUrl.hostname;
            if (hostname) {
                shouldProxy = !noProxy.some(function (rule: string) {
                    if (!rule) {
                        return false;
                    }
                    if (rule === '*') {
                        return true;
                    }
                    if (rule[0] === '.' &&
                        hostname.substr(hostname.length - rule.length) === rule) {
                        return true;
                    }

                    return hostname === rule;
                });
            }

            if (shouldProxy) {
                const httpOverHttpAgent = tunnel.httpOverHttp({
                    proxy: mainProxyOptions
                });

                const httpsOverHttpOptions: tunnel.HttpsOverHttpOptions = {
                    proxy: mainProxyOptions
                };
                if (certificateAuthority) {
                    httpsOverHttpOptions.ca = [ certificateAuthority ];
                }
                const httpsOverHttpAgent = tunnel.httpsOverHttp(httpsOverHttpOptions);

                const httpsProxyOptions: tunnel.HttpsProxyOptions = {
                    host: mainProxyOptions.host,
                    port: mainProxyOptions.port,
                    proxyAuth: mainProxyOptions.proxyAuth,
                    servername: parsedBaseUrl.hostname
                };
                if (certificateAuthority) {
                    httpsProxyOptions.ca = [ certificateAuthority ];
                }

                const httpOverHttpsAgent = tunnel.httpOverHttps({
                    proxy: httpsProxyOptions
                });

                const httpsOverHttpsOptions: tunnel.HttpsOverHttpsOptions = {
                    proxy: httpsProxyOptions
                };
                if (certificateAuthority) {
                    httpsOverHttpsOptions.ca = [ certificateAuthority ];
                }
                const httpsOverHttpsAgent = tunnel.httpsOverHttps(httpsOverHttpsOptions);

                const axiosRequestConfig: AxiosRequestConfig = {
                    proxy: false,
                };

                const baseUrlProtocol = parsedBaseUrl.protocol || 'http:';
                const proxyProtocol = parsedProxyUrl.protocol || 'http:';
                const urlIsHttps = baseUrlProtocol.startsWith('https:');
                const proxyIsHttps = proxyProtocol.startsWith('https:');

                if (urlIsHttps) {
                    if (proxyIsHttps) {
                        axiosRequestConfig.httpsAgent = httpsOverHttpsAgent;
                    } else {
                        axiosRequestConfig.httpsAgent = httpsOverHttpAgent;
                    }
                } else {
                    if (proxyIsHttps) {
                        axiosRequestConfig.httpAgent = httpsOverHttpsAgent;
                    } else {
                        axiosRequestConfig.httpAgent = httpOverHttpsAgent;
                    }
                }

                let axiosInstance = axios.create(axiosRequestConfig);

                axiosInstance.interceptors.request.use(request => {
                    console.log('Starting Request', request);
                    return request;
                });

                axiosInstance.interceptors.response.use(response => {
                    console.log('Response:', response);
                    return response;
                });

                return axiosInstance;
            }
        }
        if (certificateAuthority) {
            return axios.create({
                httpsAgent: new https.Agent({
                    ca: certificateAuthority
                })
            });
        }
        return axios;
    }

    private static isItNode() {
        return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined');
    }
}
