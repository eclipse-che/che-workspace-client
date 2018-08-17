/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

export interface IWorkspace {
    id?: string;
    config: IWorkspaceConfig;
    status: string | EWorkspaceStatus;
    namespace?: string;
    temporary?: boolean;
    attributes?: IWorkspaceAttributes;
    runtime?: IRuntime;
    links?: { [attrName: string]: string };
}

export interface IWorkspaceAttributes {
    created: number;
    updated?: number;
    stackId?: string;
    errorMessage?: string;
    [propName: string]: string | number | any;
}

export interface IWorkspaceConfig {
    name?: string;
    description?: string;
    defaultEnv: string;
    environments: {
        [environmentName: string]: any;
    };
    projects: IProjectConfig[];
    commands?: ICommand[];
    links?: ILink[];
}

export interface IProjectConfig {
    name: string;
    path: string;
    description?: string;
    mixins?: string[];
    attributes?: { [attrName: string]: string[] };
    source?: ISourceStorage;
    problems?: IProjectProblem;
}

export interface ISourceStorage {
    type: string;
    location: string;
    parameters: { [attrName: string]: string };
}

export interface IProjectProblem {
    code: number;
    message: string;
}

export interface ICommand {
    name: string;
    commandLine: string;
    type: string;
    attributes?: { [attrName: string]: string };
}

export type EWorkspaceStatus = 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED';

export interface IRuntime {
    activeEnv: string;
    machines: { [attrName: string]: IMachine };
    owner: string;
    warnings?: IWarning;
}

export interface ILink {
    href: string;
    rel?: string;
    method: string;
    produces?: string;
    consumes?: string;
    parameters?: ILinkParameter[];
    requestBody?: IRequestBodyDescriptor;
}

export interface ILinkParameter {
    name: string;
    defaultValue?: string;
    description?: string;
    type: ELinkParameterType;
    required: boolean;
    valid: string[];
}

export type ELinkParameterType = 'String' | 'Number' | 'Boolean' | 'Array' | 'Object';

export interface IRequestBodyDescriptor {
    description: string;
}

export interface IMachine {
    status: string | EMachineStatus;
    servers: { [attrName: string]: IServer };
    attributes?: { [attrName: string]: string };
}

export type EMachineStatus = 'STARTING' | 'RUNNING' | 'STOPPED' | 'FAILED';

export interface IServer {
    url: string;
    status: string | EServerStatus;
    attributes?: { [attrName: string]: string };
}

export type EServerStatus = 'RUNNING' | 'STOPPED' | 'UNKNOWN';

export interface IWarning {
    code: number;
    message: string;
}

export interface IWorkspaceSettings {
    supportedRecipeTypes: string;
}
