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
'use strict';

import {IRemoteAPI} from '../src/rest/remote-api';
import {IBackend} from '../src/rest/backend';
import {Rest} from '../src';

describe('RestAPI >', () => {

    let restApi: IRemoteAPI;
    let backend: IBackend;

    beforeEach(() => {
        restApi = Rest.getRestApi();
        backend = Rest.getBackend();

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

});
