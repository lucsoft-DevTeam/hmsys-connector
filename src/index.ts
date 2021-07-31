import { EventAction, Events } from './events/EventAction';
import { EventTypes } from './events/EventTypes';
import { CredentialsProvider } from './auth/CredentialsProvider';
import { Fetcher } from './data/Fetcher';
import { RestFetcher } from './data/RestFetcher';
import { saveInLocalStorageProvider } from "./auth/SaveInLocalStorage";
export { saveInLocalStorageProvider as createLocalStorageProvider } from './auth/SaveInLocalStorage';
export { CredentialsProvider as CustomProvider } from './auth/CredentialsProvider';
export { SignedInCredentials } from './auth/AuthStore';
export * from './events/EventAction';
export * from './events/EventTypes';
export type NetworkConnectorOptions = { AllowNonHTTPSConnection?: boolean, store: CredentialsProvider };

export class NetworkConnector {
    readonly url: string
    private events: Events[] = []
    private socket: WebSocket | undefined = undefined;
    private auth: CredentialsProvider | undefined = undefined;
    private options: NetworkConnectorOptions;
    api: Fetcher;
    rest: RestFetcher;
    constructor(url: string, options: NetworkConnectorOptions = { store: saveInLocalStorageProvider() }) {
        this.url = url;
        this.options = options;
        this.api = new Fetcher(() => this);
        this.rest = new RestFetcher(() => this, this.options.AllowNonHTTPSConnection ?? false);
    }

    rawOn = (type: EventTypes, action: EventAction) => { this.events.push({ action, type }); return this }
    sendWithAuth = (data: Object) => this.socket?.send(JSON.stringify({ ...data, auth: this.getAuth() }))
    send = (data: string | ArrayBufferLike | Blob | ArrayBufferView | Object) => {
        if (typeof data == "object") {
            this.socket?.send(JSON.stringify(data))
        } else this.socket?.send(data)
    }

    authorize(email: string, password: string) {
        this.send({
            action: "login",
            type: "client",
            email,
            password
        })
    }

    init() {
        this.socket = new WebSocket((this.options.AllowNonHTTPSConnection ? "ws://" : "wss://") + this.url);

        this.emitEvent(EventTypes.Connecting, { socket: this.socket })
        this.socket.onmessage = (x) => {
            try {
                const data = JSON.parse(x.data)
                this.emitEvent(EventTypes.RawMessage, { data, socket: this.socket })
                if (data.login === "require authentication") {
                    this.emitEvent(EventTypes.TryingLogin, { socket: this.socket })
                    const relogin = this.options.store.getReloginDetails();
                    if (relogin)
                        this.send({ action: "login", type: "client", token: relogin.token, id: relogin.id })
                    else
                        this.emitEvent(EventTypes.CredentialsRequired, { socket: this.socket })
                } else if (data.login === false) {
                    this.emitEvent(EventTypes.LoginFailed, { socket: this.socket })
                } else if (data.login === true) {
                    this.emitEvent(EventTypes.LoginSuccessful, { socket: this.socket, data })
                    this.options.store.setReloginDetails(data.client)
                } else {
                    this.emitEvent(EventTypes.Message, { socket: this.socket, data })
                }
            } catch (error) {
                console.error(error);
            }
        };
        this.socket.onopen = () => this.emitEvent(EventTypes.Conncted, { socket: this.socket })
        this.socket.onclose = () => this.emitEvent(EventTypes.Disconnected, { socket: this.socket })
        this.socket.onerror = () => this.emitEvent(EventTypes.Disconnected, { socket: this.socket })

    }

    getAuth = () => this.auth?.getReloginDetails();

    private emitEvent(type: EventTypes, data: any) {
        this.events.filter(x => x.type == type).forEach(x => x.action(data))
        return this;
    }

}
