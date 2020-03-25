import { IClientEventHandler, ICommunicationClient } from './web-socket-client';
export interface IWorkspaceMasterApi {
    connect(entryPoint: string): Promise<any>;
    subscribeEnvironmentOutput(workspaceId: string, callback: Function): void;
    unSubscribeEnvironmentOutput(workspaceId: string, callback: Function): void;
    subscribeEnvironmentStatus(workspaceId: string, callback: Function): void;
    unSubscribeEnvironmentStatus(workspaceId: string, callback: Function): void;
    subscribeWsAgentOutput(workspaceId: string, callback: Function): void;
    unSubscribeWsAgentOutput(workspaceId: string, callback: Function): void;
    subscribeWorkspaceStatus(workspaceId: string, callback: Function): void;
    unSubscribeWorkspaceStatus(workspaceId: string, callback: Function): void;
    subscribeOrganizationStatus(organizationId: string, callback: Function): void;
    unSubscribeOrganizationStatus(organizationId: string, callback: Function): void;
    subscribeOrganizationMembershipStatus(userId: string, callback: Function): void;
    unSubscribeOrganizationMembershipStatus(userId: string, callback: Function): void;
    fetchClientId(): Promise<any>;
    getClientId(): string;
}
/**
 * Client API for workspace master interactions.
 *
 * @author Ann Shumilova
 */
export declare class WorkspaceMasterApi implements IWorkspaceMasterApi {
    private jsonRpcApiClient;
    private clientId;
    private maxReconnectionAttempts;
    private reconnectionAttemptNumber;
    private reconnectionDelay;
    constructor(client: ICommunicationClient, entryPoint: string);
    /**
     * Opens connection to pointed entryPoint.
     *
     * @param entryPoint
     * @returns {Promise<any>}
     */
    connect(entryPoint: string): Promise<any>;
    /**
     * Subscribes the environment output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeEnvironmentOutput(workspaceId: string, callback: IClientEventHandler): void;
    /**
     * Un-subscribes the pointed callback from the environment output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeEnvironmentOutput(workspaceId: string, callback: IClientEventHandler): void;
    /**
     * Subscribes the environment status changed.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeEnvironmentStatus(workspaceId: string, callback: IClientEventHandler): void;
    /**
     * Un-subscribes the pointed callback from environment status changed.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeEnvironmentStatus(workspaceId: string, callback: IClientEventHandler): void;
    /**
     * Subscribes on workspace agent output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeWsAgentOutput(workspaceId: string, callback: IClientEventHandler): void;
    /**
     * Un-subscribes from workspace agent output.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    unSubscribeWsAgentOutput(workspaceId: string, callback: IClientEventHandler): void;
    /**
     * Subscribes to workspace's status.
     *
     * @param workspaceId workspace's id
     * @param callback callback to process event
     */
    subscribeWorkspaceStatus(workspaceId: string, callback: Function): void;
    /**
     * Un-subscribes pointed callback from workspace's status.
     *
     * @param workspaceId
     * @param callback
     */
    unSubscribeWorkspaceStatus(workspaceId: string, callback: IClientEventHandler): void;
    /**
     * Subscribe to organization statuses.
     *
     * @param {string} organizationId organization's id
     * @param {IClientEventHandler} callback handler
     */
    subscribeOrganizationStatus(organizationId: string, callback: IClientEventHandler): void;
    /**
     * Un-subscribe from organization status changes.
     *
     * @param {string} organizationId organization's id
     * @param {IClientEventHandler} callback handler
     */
    unSubscribeOrganizationStatus(organizationId: string, callback: IClientEventHandler): void;
    /**
     * Subscribe to organization membership changes.
     *
     * @param {string} userId user's id to track changes
     * @param {IClientEventHandler} callback handler
     */
    subscribeOrganizationMembershipStatus(userId: string, callback: IClientEventHandler): void;
    /**
     * Un-subscribe from organization membership changes.
     *
     * @param {string} userId user's id to untrack changes
     * @param {IClientEventHandler} callback handler
     */
    unSubscribeOrganizationMembershipStatus(userId: string, callback: IClientEventHandler): void;
    /**
     * Fetch client's id and stores it.
     *
     * @returns {Promise<any>}
     */
    fetchClientId(): Promise<any>;
    /**
     * Returns client's id.
     *
     * @returns {string} client connection identifier
     */
    getClientId(): string;
    private onConnectionOpen();
    private onConnectionClose(entryPoint);
    /**
     * Performs subscribe to the pointed channel for pointed workspace's ID and callback.
     *
     * @param channel channel to un-subscribe
     * @param _scope the scope of the request
     * @param id instance's id (scope value)
     * @param callback callback
     */
    private subscribe(channel, _scope, id, callback);
    /**
     * Performs un-subscribe of the pointed channel by pointed workspace's ID and callback.
     *
     * @param channel channel to un-subscribe
     * @param _scope the scope of the request
     * @param id instance's id (scope value)
     * @param callback callback
     */
    private unsubscribe(channel, _scope, id, callback);
}
