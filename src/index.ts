/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { IRemoteAPI, RemoteAPI } from './rest/remote-api';
import { Resources } from './rest/resources';
import * as fs from 'fs';
import * as https from 'https';
import * as url from 'url';
import * as tunnel from 'tunnel';
import { UrlWithStringQuery } from 'url';

export * from './rest/remote-api';
export * from './json-rpc/workspace-master-api';

export interface IRestAPIConfig {
    baseUrl?: string;
    headers?: any;
    // path to self signed certificate
    ssCrtPath?: string;
    loggingEnabled?: boolean;
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
                    ca: certificateAuthority ? [certificateAuthority] : undefined
                });
                const httpsOverHttpsAgent = tunnel.httpsOverHttps({
                    proxy: httpsProxyOptions,
                    ca: certificateAuthority ? [certificateAuthority] : undefined
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

    private static getCertificateAuthority(config: IRestAPIConfig): Buffer | undefined {
        let certificateAuthority: Buffer | undefined;
        if (config.ssCrtPath && fs.existsSync(config.ssCrtPath)) {
            certificateAuthority = fs.readFileSync(config.ssCrtPath);
        }
        return certificateAuthority;
    }

    private static getMainProxyOptions(parsedProxyUrl: UrlWithStringQuery): tunnel.ProxyOptions {
        const port = Number(parsedProxyUrl.port);
        return {
            host: parsedProxyUrl.hostname!,
            port: ( parsedProxyUrl.port !== '' && !isNaN(port)) ? port : 3128,
            proxyAuth: (parsedProxyUrl.auth && parsedProxyUrl.auth !== '') ? parsedProxyUrl.auth : undefined
        };
    }

    private static getHttpsProxyOptions(mainProxyOptions: tunnel.ProxyOptions, servername: string | undefined, certificateAuthority: Buffer | undefined): tunnel.HttpsProxyOptions {
        return {
            host: mainProxyOptions.host,
            port: mainProxyOptions.port,
            proxyAuth: mainProxyOptions.proxyAuth,
            servername,
            ca: certificateAuthority ? [certificateAuthority] : undefined
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
