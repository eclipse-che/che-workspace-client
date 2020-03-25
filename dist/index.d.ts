import { IRemoteAPI } from './rest/remote-api';
import { IWorkspaceMasterApi } from './json-rpc/workspace-master-api';
export * from './rest/remote-api';
export * from './json-rpc/workspace-master-api';
export interface IRestAPIConfig {
    baseUrl?: string;
    headers?: any;
    ssCrtPath?: string;
    loggingEnabled?: boolean;
}
export default class WorkspaceClient {
    static getRestApi(config?: IRestAPIConfig): IRemoteAPI;
    static getJsonRpcApi(entryPoint: string): IWorkspaceMasterApi;
    private static createAxiosInstance(config);
    private static isItNode();
    private static addLogInterceptorsIfEnabled(axiosInstance, config);
    private static getCertificateAuthority(config);
    private static getMainProxyOptions(parsedProxyUrl);
    private static getHttpsProxyOptions(mainProxyOptions, servername, certificateAuthority);
    private static shouldProxy(hostname);
}
