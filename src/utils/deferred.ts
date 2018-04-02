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

export interface IDeferred<T> {
    promise: Promise<T>;
    resolve(value?: T): void;
    reject(reason?: any): void;
}

export class Deferred<T> implements IDeferred<T> {
    promise: Promise<T>;
    resolve: (value?: T) => void = () => { return; };
    reject: (value?: T) => void = () => { return; };
    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
