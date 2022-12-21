"use strict";
/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteAPI = exports.RequestError = exports.METHOD = void 0;
var METHOD;
(function (METHOD) {
    METHOD[METHOD["getAll"] = 0] = "getAll";
    METHOD[METHOD["getAllByNamespace"] = 1] = "getAllByNamespace";
    METHOD[METHOD["fetchById"] = 2] = "fetchById";
    METHOD[METHOD["create"] = 3] = "create";
    METHOD[METHOD["update"] = 4] = "update";
    METHOD[METHOD["delete"] = 5] = "delete";
    METHOD[METHOD["start"] = 6] = "start";
    METHOD[METHOD["startTemporary"] = 7] = "startTemporary";
    METHOD[METHOD["stop"] = 8] = "stop";
    METHOD[METHOD["getSettings"] = 9] = "getSettings";
})(METHOD = exports.METHOD || (exports.METHOD = {}));
var RequestError = /** @class */ (function () {
    function RequestError(error) {
        if (error.code) {
            this.status = Number(error.code);
        }
        this.name = error.name;
        this.config = error.config;
        if (error.request) {
            this.request = error.request;
        }
        if (error.response) {
            this.response = error.response;
        }
        if ((this.status === -1 || !this.status) && (!this.response || (this.response && !this.response.status))) {
            // request is interrupted, there is not even an error
            this.message = "network issues occured while requesting \"" + this.config.url + "\".";
        }
        else if (this.response && this.response.data && this.response.data.message) {
            // che Server error that should be self-descriptive
            this.message = this.response.data.message;
        }
        else {
            // the error is not from Che Server, so error may be in html format that we're not able to handle.
            // displaying just a error code and URL.
            // sometimes status won't be defined, so when it's not look into the response status more info
            var status_1 = this.status;
            if (!this.status && this.response && this.response.status) {
                status_1 = this.response.status;
                // defer to the status code of the request if there is no response
            }
            else if (!this.status && this.request && this.request.status) {
                status_1 = this.request.status;
            }
            this.message = "\"" + status_1 + "\" returned by \"" + this.config.url + "\".\"";
        }
    }
    return RequestError;
}());
exports.RequestError = RequestError;
var RemoteAPI = /** @class */ (function () {
    function RemoteAPI(remoteApi) {
        this.promises = new Map();
        this.remoteAPI = remoteApi;
    }
    RemoteAPI.prototype.getAll = function () {
        var _this = this;
        var key = this.buildKey(METHOD.getAll);
        var promise = this.getRequestPromise(key);
        if (promise) {
            return promise;
        }
        var newPromise = new Promise(function (resolve, reject) {
            _this.remoteAPI.getAll()
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
        this.saveRequestPromise(key, newPromise);
        return newPromise;
    };
    RemoteAPI.prototype.getAllByNamespace = function (namespace) {
        var _this = this;
        var key = this.buildKey(METHOD.getAllByNamespace, namespace);
        var promise = this.getRequestPromise(key);
        if (promise) {
            return promise;
        }
        var newPromise = new Promise(function (resolve, reject) {
            _this.remoteAPI.getAllByNamespace(namespace)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
        this.saveRequestPromise(key, newPromise);
        return newPromise;
    };
    RemoteAPI.prototype.getById = function (workspaceKey) {
        var _this = this;
        var key = this.buildKey(METHOD.getAllByNamespace, workspaceKey);
        var promise = this.getRequestPromise(key);
        if (promise) {
            return promise;
        }
        var newPromise = new Promise(function (resolve, reject) {
            _this.remoteAPI.getById(workspaceKey)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
        this.saveRequestPromise(key, newPromise);
        return newPromise;
    };
    RemoteAPI.prototype.create = function (devfile, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.create(devfile, params)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.update = function (workspaceId, workspace) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.update(workspaceId, workspace)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.delete = function (workspaceId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.delete(workspaceId)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.start = function (workspaceId, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.start(workspaceId, params)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.stop = function (workspaceId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.stop(workspaceId)
                .then(function (response) {
                resolve();
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getSettings = function () {
        var _this = this;
        var key = this.buildKey(METHOD.getSettings);
        var promise = this.getRequestPromise(key);
        if (promise) {
            return promise;
        }
        var newPromise = new Promise(function (resolve, reject) {
            _this.remoteAPI.getSettings()
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
        this.saveRequestPromise(key, newPromise);
        return newPromise;
    };
    RemoteAPI.prototype.getFactoryResolver = function (url, overrideParams) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getFactoryResolver(url, overrideParams)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.refreshFactoryOauthToken = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.refreshFactoryOauthToken(url)
                .then(function () { return resolve(); })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.generateSshKey = function (service, name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.generateSshKey(service, name)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.createSshKey = function (sshKeyPair) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.createSshKey(sshKeyPair)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getSshKey = function (service, name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getSshKey(service, name)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getAllSshKey = function (service) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getAllSshKey(service)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.deleteSshKey = function (service, name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.deleteSshKey(service, name)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getCurrentUser = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getCurrentUser()
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getCurrentUserProfile = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getCurrentUserProfile()
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getUserPreferences = function (filter) {
        var _this = this;
        if (filter === void 0) { filter = undefined; }
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getUserPreferences(filter)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.updateUserPreferences = function (update) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.updateUserPreferences(update)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.replaceUserPreferences = function (preferences) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.replaceUserPreferences(preferences)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.deleteUserPreferences = function (list) {
        var _this = this;
        if (list === void 0) { list = undefined; }
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.deleteUserPreferences(list)
                .then(function (response) {
                resolve();
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getOAuthToken = function (oAuthProvider) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getOAuthToken(oAuthProvider)
                .then(function (response) {
                resolve(response.data.token);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.deleteOAuthToken = function (oAuthProvider) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.deleteOAuthToken(oAuthProvider)
                .then(function () { return resolve(); })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getOAuthProviders = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getOAuthProviders()
                .then(function (response) {
                resolve(response.data.map(function (provider) { return provider.name; }));
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getKubernetesNamespace = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getKubernetesNamespace()
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.provisionKubernetesNamespace = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.provisionKubernetesNamespace()
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getDevfileSchema = function (version) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getDevfileSchema(version)
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.getApiInfo = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.getApiInfo()
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    RemoteAPI.prototype.updateActivity = function (workspaceId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.remoteAPI.updateActivity(workspaceId)
                .then(function () { return resolve(); })
                .catch(function (error) {
                reject(new RequestError(error));
            });
        });
    };
    /**
     * Returns a string key to identify the request.
     *
     * @param {METHOD} method a method name
     * @param {string} args
     * @returns {string}
     */
    RemoteAPI.prototype.buildKey = function (method) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.unshift(method.toString());
        return args.join('-');
    };
    /**
     * Returns stored request promise by a string key.
     *
     * @param {string} key a key to identify the request promise
     * @returns {Promise<any> | undefined}
     */
    RemoteAPI.prototype.getRequestPromise = function (key) {
        return this.promises.get(key);
    };
    /**
     * Save the request promise.
     *
     * @param {string} key a key to identify the request promise.
     * @param {Promise<any>} promise a request promise
     */
    RemoteAPI.prototype.saveRequestPromise = function (key, promise) {
        var _this = this;
        this.promises.set(key, promise);
        promise.then(function () { return _this.promises.delete(key); }, function () { return _this.promises.delete(key); });
    };
    return RemoteAPI;
}());
exports.RemoteAPI = RemoteAPI;
