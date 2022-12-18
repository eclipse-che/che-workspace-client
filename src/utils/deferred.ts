/*
 * Copyright (c) 2018-2021 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

export interface IDeferred<T> {
  promise: Promise<T>;
  resolve(value?: T): void;
  reject(reason?: any): void;
}

export class Deferred<T> implements IDeferred<T> {
  promise: Promise<T>;
  resolve: (value?: T) => void = () => {
    return;
  };
  reject: (value?: T) => void = () => {
    return;
  };
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve as (value?: T | undefined) => void;
      this.reject = reject;
    });
  }
}
