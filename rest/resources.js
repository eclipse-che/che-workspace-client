"use strict";
/*********************************************************************
 * Copyright (c) 2018-2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resources = void 0;
var Qs = require("qs");
var Resources = /** @class */ (function () {
    function Resources(axios, baseUrl) {
        this.axios = axios;
        this.baseUrl = baseUrl;
        this.workspaceUrl = '/workspace';
        this.factoryUrl = '/factory';
        this.devfileUrl = '/devfile';
    }
    Resources.prototype.getAll = function () {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.workspaceUrl,
        });
    };
    Resources.prototype.getAllByNamespace = function (namespace) {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.workspaceUrl + "/namespace/" + namespace,
        });
    };
    Resources.prototype.getById = function (workspaceKey) {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.workspaceUrl + "/" + workspaceKey,
        });
    };
    Resources.prototype.create = function (devfile, createParams) {
        if (createParams === void 0) { createParams = {}; }
        var attributes = createParams.attributes, namespace = createParams.namespace, infrastructureNamespace = createParams.infrastructureNamespace;
        var attr = attributes ? Object.keys(attributes).map(function (key) { return key + ":" + attributes[key]; }) : [];
        return this.axios.request({
            method: 'POST',
            baseURL: this.baseUrl,
            url: this.workspaceUrl + "/devfile",
            data: devfile,
            params: {
                attribute: attr,
                namespace: namespace,
                'infrastructure-namespace': infrastructureNamespace,
            },
            paramsSerializer: function (params) {
                return Qs.stringify(params, { arrayFormat: 'repeat' });
            },
        });
    };
    Resources.prototype.update = function (workspaceId, workspace) {
        return this.axios.request({
            method: 'PUT',
            data: workspace,
            baseURL: this.baseUrl,
            url: this.workspaceUrl + "/" + workspaceId,
        });
    };
    Resources.prototype.delete = function (workspaceId) {
        return this.axios.request({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: this.workspaceUrl + "/" + workspaceId,
        });
    };
    Resources.prototype.start = function (workspaceId, params) {
        return this.axios.request({
            method: 'POST',
            data: {},
            baseURL: this.baseUrl,
            url: this.workspaceUrl + "/" + workspaceId + "/runtime",
            params: params ? params : {},
        });
    };
    Resources.prototype.stop = function (workspaceId) {
        return this.axios.request({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: this.workspaceUrl + "/" + workspaceId + "/runtime",
        });
    };
    Resources.prototype.getSettings = function () {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.workspaceUrl + "/settings",
        });
    };
    Resources.prototype.getFactoryResolver = function (url, overrideParams) {
        if (overrideParams === void 0) { overrideParams = {}; }
        var data = Object.assign({}, overrideParams, { url: url });
        return this.axios.request({
            method: 'POST',
            baseURL: this.baseUrl,
            url: this.factoryUrl + "/resolver/",
            data: data
        });
    };
    Resources.prototype.refreshFactoryOauthToken = function (url) {
        return this.axios.request({
            method: 'POST',
            baseURL: this.baseUrl,
            url: this.factoryUrl + "/token/refresh?url=" + url
        });
    };
    Resources.prototype.generateSshKey = function (service, name) {
        return this.axios.request({
            method: 'POST',
            baseURL: this.baseUrl,
            data: { service: service, name: name },
            url: "/ssh/generate",
        });
    };
    Resources.prototype.createSshKey = function (sshKeyPair) {
        return this.axios.request({
            method: 'POST',
            data: sshKeyPair,
            baseURL: this.baseUrl,
            url: "/ssh/",
        });
    };
    Resources.prototype.getSshKey = function (service, name) {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: "/ssh/" + service + "/find?name=" + name,
        });
    };
    Resources.prototype.getAllSshKey = function (service) {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: "/ssh/" + service,
        });
    };
    Resources.prototype.getCurrentUser = function () {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: "/user",
        });
    };
    Resources.prototype.getCurrentUserProfile = function () {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: "/profile",
        });
    };
    Resources.prototype.deleteSshKey = function (service, name) {
        return this.axios.request({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: "/ssh/" + service + "?name=" + name,
        });
    };
    Resources.prototype.getUserPreferences = function (filter) {
        if (filter === void 0) { filter = undefined; }
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: filter ? "/preferences?filter=" + filter : '/preferences',
        });
    };
    Resources.prototype.updateUserPreferences = function (update) {
        return this.axios.request({
            method: 'PUT',
            baseURL: this.baseUrl,
            url: "/preferences",
            data: update,
        });
    };
    Resources.prototype.replaceUserPreferences = function (preferences) {
        return this.axios.request({
            method: 'POST',
            baseURL: this.baseUrl,
            url: "/preferences",
            data: preferences,
        });
    };
    Resources.prototype.deleteUserPreferences = function (list) {
        if (list === void 0) { list = undefined; }
        if (list) {
            return this.axios.request({
                method: 'DELETE',
                baseURL: this.baseUrl,
                url: "/preferences",
                data: list,
            });
        }
        return this.axios.request({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: "/preferences",
        });
    };
    Resources.prototype.getOAuthToken = function (oAuthProvider) {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: "/oauth/token?oauth_provider=" + oAuthProvider,
        });
    };
    Resources.prototype.deleteOAuthToken = function (oAuthProvider) {
        return this.axios.request({
            method: 'DELETE',
            baseURL: this.baseUrl,
            url: "/oauth/token?oauth_provider=" + oAuthProvider,
        });
    };
    Resources.prototype.getOAuthProviders = function () {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: '/oauth',
        });
    };
    Resources.prototype.updateActivity = function (workspaceId) {
        return this.axios.request({
            method: 'PUT',
            baseURL: this.baseUrl,
            url: "/activity/" + workspaceId,
        });
    };
    Resources.prototype.getDevfileSchema = function (version) {
        var requestOptions = {
            method: 'GET',
            baseURL: this.baseUrl,
            url: this.devfileUrl
        };
        if (version) {
            requestOptions.params = {
                version: version
            };
        }
        return this.axios.request(requestOptions);
    };
    Resources.prototype.getKubernetesNamespace = function () {
        return this.axios.request({
            method: 'GET',
            baseURL: this.baseUrl,
            url: '/kubernetes/namespace',
        });
    };
    Resources.prototype.provisionKubernetesNamespace = function () {
        return this.axios.request({
            method: 'POST',
            baseURL: this.baseUrl,
            url: '/kubernetes/namespace/provision',
        });
    };
    Resources.prototype.getApiInfo = function () {
        return this.axios.request({
            method: 'OPTIONS',
            baseURL: this.baseUrl,
        });
    };
    return Resources;
}());
exports.Resources = Resources;
