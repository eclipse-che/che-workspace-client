/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import axios, { AxiosInstance, AxiosStatic, AxiosRequestConfig } from 'axios';
import { IRemoteAPI, RemoteAPI } from './rest/remote-api';
import { Resources } from './rest/resources';
import { IWorkspaceMasterApi, WorkspaceMasterApi } from './json-rpc/workspace-master-api';
import { WebSocketClient } from './json-rpc/web-socket-client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as url from 'url';
import * as tunnel from 'tunnel';

export * from './rest/remote-api';
export * from './json-rpc/workspace-master-api';

export interface IRestAPIConfig {
    baseUrl?: string;
    headers?: any;
    // path to self signed certificate
    ssCrtPath?: string;
    // path to public certificates
    publicCrtPath?: string;
    loggingEnabled?: boolean;
    machineToken?: string;
    userToken?: string;
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

        const axios = this.createAxiosInstance(config)

        if (config.headers) {
            for (const key in config.headers) {
                if (config.headers.hasOwnProperty(key)) {
                    axios.defaults.headers.common[key] = config.headers[key];
                }
            }
            const token = config.userToken ? config.userToken : config.machineToken;
            if (token) {
                const header = 'Authorization';
                axios.defaults.headers.common[header] = `Bearer ${token}`;
            }
        }

        const resources = new Resources(axios, baseUrl);
        return new RemoteAPI(resources);
    }

    public static getJsonRpcApi(entryPoint: string): IWorkspaceMasterApi {
        const transport = new WebSocketClient();
        return new WorkspaceMasterApi(transport, entryPoint);
    }

    private static createAxiosInstance(config: IRestAPIConfig): AxiosInstance {
        if (!this.isItNode()) {
            this.addLogInterceptorsIfEnabled(axios, config);
            return axios;
        }

        const certificateAuthority = this.getCertificateAuthority(config);
        const proxyUrl = process.env.http_proxy;
        if (proxyUrl && proxyUrl !== '' && config.baseUrl) {
            const parsedBaseUrl = url.parse(config.baseUrl);
            if (parsedBaseUrl.hostname && this.shouldProxy(parsedBaseUrl.hostname)) {
                const axiosRequestConfig: AxiosRequestConfig | undefined = {
                    proxy: false,
                };
                const parsedProxyUrl = url.parse(proxyUrl);
                const mainProxyOptions = this.getMainProxyOptions(parsedProxyUrl);
                const httpsProxyOptions = this.getHttpsProxyOptions(mainProxyOptions, parsedBaseUrl.hostname, certificateAuthority);
                const httpOverHttpAgent = tunnel.httpOverHttp({ proxy: mainProxyOptions });
                const httpOverHttpsAgent = tunnel.httpOverHttps({ proxy: httpsProxyOptions });
                const httpsOverHttpAgent = tunnel.httpsOverHttp({
                    proxy: mainProxyOptions,
                    ca: certificateAuthority
                });
                const httpsOverHttpsAgent = tunnel.httpsOverHttps({
                    proxy: httpsProxyOptions,
                    ca: certificateAuthority
                });
                const urlIsHttps = (parsedBaseUrl.protocol || 'http:').startsWith('https:');
                const proxyIsHttps = (parsedProxyUrl.protocol || 'http:').startsWith('https:');
                if (urlIsHttps) {
                    axiosRequestConfig.httpsAgent = proxyIsHttps ? httpsOverHttpsAgent : httpsOverHttpAgent;
                } else {
                    axiosRequestConfig.httpAgent = proxyIsHttps ? httpOverHttpsAgent : httpOverHttpAgent;
                }
                const axiosInstance = axios.create(axiosRequestConfig);
                this.addLogInterceptorsIfEnabled(axiosInstance, config);
                return axiosInstance;
            }
        }
        if (certificateAuthority) {
            const axiosInstance = axios.create({
                httpsAgent: new https.Agent({
                    ca: certificateAuthority
                })
            });
            this.addLogInterceptorsIfEnabled(axiosInstance, config);
            return axiosInstance;
        }
        this.addLogInterceptorsIfEnabled(axios, config);
        return axios;
    }

    private static isItNode() {
        return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined');
    }

    private static addLogInterceptorsIfEnabled(axiosInstance: AxiosInstance, config: IRestAPIConfig) {
        if (!config.loggingEnabled) {
            return;
        }
        axiosInstance.interceptors.request.use(request => {
            console.log('Starting Request', request);
            return request;
        });

        axiosInstance.interceptors.response.use(response => {
            console.log('Response:', response);
            return response;
        });
    }

    private static getCertificateAuthority(config: IRestAPIConfig): Buffer[] | undefined {
        const certificateAuthority: Buffer[] = [];
        if (config.ssCrtPath && fs.existsSync(config.ssCrtPath)) {
            certificateAuthority.push(fs.readFileSync(config.ssCrtPath));
        }

        if (config.publicCrtPath && fs.existsSync(config.publicCrtPath)) {
            const publicCertificates = fs.readdirSync(config.publicCrtPath);
            for (const publicCertificate of publicCertificates) {
                if (publicCertificate.endsWith('.crt')) {
                    const certPath = path.join(config.publicCrtPath, publicCertificate);
                    certificateAuthority.push(fs.readFileSync(certPath));
                }
            }
        }

        return certificateAuthority.length > 0 ? certificateAuthority : undefined;
    }

    private static getMainProxyOptions(parsedProxyUrl: url.UrlWithStringQuery): tunnel.ProxyOptions {
        const port = Number(parsedProxyUrl.port);
        return {
            host: parsedProxyUrl.hostname!,
            port: ( parsedProxyUrl.port !== '' && !isNaN(port)) ? port : 3128,
            proxyAuth: (parsedProxyUrl.auth && parsedProxyUrl.auth !== '') ? parsedProxyUrl.auth : undefined
        };
    }

    private static getHttpsProxyOptions(mainProxyOptions: tunnel.ProxyOptions, servername: string | undefined, certificateAuthority: Buffer[] | undefined): tunnel.HttpsProxyOptions {
        return {
            host: mainProxyOptions.host,
            port: mainProxyOptions.port,
            proxyAuth: mainProxyOptions.proxyAuth,
            servername,
            ca: certificateAuthority
        };
    }

    private static shouldProxy(hostname: string): boolean {
        const noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        const noProxy: string[] = noProxyEnv ? noProxyEnv.split(',').map(s => s.trim()) : [];
        return !noProxy.some(rule => {
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
}
