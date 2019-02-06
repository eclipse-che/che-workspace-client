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

import {IRemoteAPI} from '../src/rest/remote-api';
import {IBackend} from '../src/rest/backend';
import WorkspaceClient from '../src';

describe('RestAPI >', () => {

    let restApi: IRemoteAPI;
    let backend: IBackend;

    beforeEach(() => {
        restApi = WorkspaceClient.getRestApi();
        backend = WorkspaceClient.getRestBackend();

        backend.install();
    });

    afterEach(() => {
        backend.uninstall();
    });

    it('dummy test', (done) => {
        backend.stubRequest('GET', '/workspace', {
            status: 200,
            responseText: 'Hello'
        });

        const spySucceed = jasmine.createSpy('succeed');
        const spyFailed = jasmine.createSpy('failed');
        restApi.getAll().then(spySucceed, spyFailed);

        backend.wait(() => {
            expect(spySucceed.calls.count()).toEqual(1);
            expect(spyFailed.calls.count()).toEqual(0);
            done();
        });
    });

    it('should receive all user preferences', (done) => {
        backend.stubRequest('GET', '/preferences', {
            status: 200,
            responseText: '{"key1":"value", "key2": 5}'
        });

        const spySucceed = jasmine.createSpy('succeed');
        const spyFailed = jasmine.createSpy('failed');
        restApi.getUserPreferences().then(spySucceed, spyFailed);

        backend.wait(() => {
            expect(spySucceed.calls.count()).toEqual(1);
            expect(spyFailed.calls.count()).toEqual(0);
            done();
        });
    });

});
