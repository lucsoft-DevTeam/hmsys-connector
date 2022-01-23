import { EventAction, Events } from './events/EventAction.ts';
import { EventTypes } from './events/EventTypes.ts';
import { CredentialsProvider } from './auth/CredentialsProvider.ts';
import { Fetcher } from './data/Fetcher.ts';
import { RestFetcher } from './data/RestFetcher.ts';
import { saveInLocalStorageProvider } from "./auth/SaveInLocalStorage.ts";
import { Message, MessageType } from "./spec/ws.ts";
export { saveInLocalStorageProvider as createLocalStorageProvider } from './auth/SaveInLocalStorage.ts';
export type { CredentialsProvider as CustomProvider } from './auth/CredentialsProvider.ts';
export type { SignedInCredentials } from './auth/AuthStore.ts';
export * from './events/EventAction.ts';
export * from './spec/ws.ts';
export * from './events/EventTypes.ts';
export type NetworkConnectorOptions = { AllowNonHTTPSConnection?: boolean, store: CredentialsProvider };

export class NetworkConnector {
    readonly url: string
    #events: Events[] = []
    #socket: WebSocket | undefined = undefined;
    #options: NetworkConnectorOptions;
    api: Fetcher;
    rest: RestFetcher;
    timeout = 1000;
    constructor(url: string, options: NetworkConnectorOptions = { store: saveInLocalStorageProvider() }) {
        this.url = url;
        this.#options = options;
        this.api = new Fetcher(() => this);
        this.rest = new RestFetcher(() => this, this.#options.AllowNonHTTPSConnection ?? false);
    }

    rawOn = (type: EventTypes, action: EventAction) => { this.#events.push({ action, type }); return this }
    sendWithAuth = (data: Message) => this.#socket?.send(JSON.stringify({ ...data, auth: this.getAuth() }))
    send = (data: Message) => {
        if (typeof data == "object") {
            this.#socket?.send(JSON.stringify(data))
        } else this.#socket?.send(data)
    }

    authorize(email: string, password: string) {
        this.send({
            action: MessageType.Login,
            type: "client",
            email,
            password
        })
    }

    restart() {
        this.#socket?.close();
        this.#socket == undefined;
        this.ready();
    }

    ready() {
        if (this.#socket && [ 0, 1 ].includes(this.#socket.readyState)) return true;
        this.#socket = new WebSocket((this.#options.AllowNonHTTPSConnection ? "ws://" : "wss://") + this.url);

        this.emitEvent(EventTypes.Connecting, { socket: this.#socket })
        this.#socket.onmessage = (x) => {
            try {
                const data = JSON.parse(x.data)
                this.emitEvent(EventTypes.RawMessage, { data, socket: this.#socket })
                if (data.login === "require authentication") {
                    this.emitEvent(EventTypes.TryingLogin, { socket: this.#socket })
                    const relogin = this.#options.store.getReloginDetails();
                    if (relogin)
                        this.send({ action: MessageType.Login, type: "client", token: relogin.token, id: relogin.id })
                    else
                        this.emitEvent(EventTypes.CredentialsRequired, { socket: this.#socket })
                } else if (data.login === false) {
                    this.emitEvent(EventTypes.LoginFailed, { socket: this.#socket })
                } else if (data.login === true) {
                    this.#options.store.setReloginDetails(data.client)
                    this.emitEvent(EventTypes.LoginSuccessful, { socket: this.#socket, data })
                } else {
                    this.emitEvent(EventTypes.Message, { socket: this.#socket, data })
                }
            } catch (error) {
                console.error(error);
            }
        };
        this.#socket.onopen = () => this.emitEvent(EventTypes.Conncted, { socket: this.#socket })
        this.#socket.onclose = () => this.emitEvent(EventTypes.Disconnected, { socket: this.#socket })
        this.#socket.onerror = () => this.emitEvent(EventTypes.Disconnected, { socket: this.#socket })

    }

    getAuth = () => this.#options.store?.getReloginDetails();

    private emitEvent(type: EventTypes, data: unknown) {
        this.#events.filter(x => x.type == type).forEach(x => x.action(data))
        return this;
    }

}
