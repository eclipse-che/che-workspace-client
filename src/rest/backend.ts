/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
/// <reference path="../../typings/moxios.d.ts" />

import { AxiosInstance } from 'axios';
import { Moxios } from 'moxios';

export interface IBackend {
    install(): void;
    uninstall(): void;
    stubRequest(method: string, urlOrRegExp: string | RegExp, response: IBackendResponse): void;
    stubOnce(method: string, orlOrRegExp: string | RegExp, response: IBackendResponse): Promise<any>;
    stubFailure(method: string, orlOrRegExp: string | RegExp, response: IBackendResponse): Promise<any>;
    stubTimeout(urlOrRegExp: string | RegExp): void;
    wait(fn: Function): Promise<any>;
    wait(delay: number, fn: Function): Promise<any>;
}

export interface IBackendResponse {
    status?: number;
    response?: any;
    responseText?: string;
}

export class Backend implements IBackend {

    constructor(private readonly axios: AxiosInstance,
                private readonly moxios: Moxios) {
    }

    install(): void {
        this.moxios.install(this.axios);
    }

    stubFailure(method: string, urlOrRegExp: string | RegExp, response: any): Promise<any> {
        return this.moxios.stubFailure(method, urlOrRegExp, response);
    }

    stubOnce(method: string, urlOrRegExp: string | RegExp, response: any): Promise<any> {
        return this.moxios.stubFailure(method, urlOrRegExp, response);
    }

    stubRequest(method: string, urlOrRegExp: string | RegExp, response: any): void {
        this.moxios.stubRequest(method, urlOrRegExp, response);
    }

    stubTimeout(urlOrRegExp: string | RegExp): void {
        this.moxios.stubTimeout(urlOrRegExp);
    }

    uninstall(): void {
        this.moxios.uninstall(this.axios);
    }

    wait(...args: any[]): Promise<any> {
        return this.moxios.wait(...args);
    }

}
