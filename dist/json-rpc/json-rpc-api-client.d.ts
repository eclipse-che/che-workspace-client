import { IClientEventHandler, ICommunicationClient } from './web-socket-client';
/**
 * Class for basic CHE API communication methods.
 *
 * @author Ann Shumilova
 */
export declare class JsonRpcApiClient {
    /**
     * Client that implements JSON RPC protocol.
     */
    private jsonRpcClient;
    /**
     * Communication client (can be http, websocket).
     */
    private client;
    constructor(client: ICommunicationClient);
    /**
     * Subscribe on the events from service.
     *
     * @param event event's name to subscribe
     * @param notification notification name to handle
     * @param handler event's handler
     * @param params params (optional)
     */
    subscribe(event: string, notification: string, handler: IClientEventHandler, params?: any): void;
    /**
     * Unsubscribe concrete handler from events from service.
     *
     * @param event event's name to unsubscribe
     * @param notification notification name binded to the event
     * @param handler handler to be removed
     * @param params params (optional)
     */
    unsubscribe(event: string, notification: string, handler: IClientEventHandler, params?: any): void;
    /**
     * Connects to the pointed entrypoint
     *
     * @param entrypoint entrypoint to connect to
     * @returns {Promise<any>} promise
     */
    connect(entrypoint: string): Promise<any>;
    /**
     * Makes request.
     *
     * @param method
     * @param params
     * @returns {Promise<any>}
     */
    request(method: string, params?: any): Promise<any>;
}
