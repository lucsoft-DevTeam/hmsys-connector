import { EventAction } from './events/EventAction';
import { EventTypes } from './events/EventTypes';
import { CustomProvider } from './auth/CustomProvider';
import { Fetcher } from './data/Fetcher';
import { RestFetcher } from './data/RestFetcher';
export { createLocalStorageProvider } from './auth/LocalStorageProvider';
export { CustomProvider } from './auth/CustomProvider';
export { LoginData, ReloginData } from './auth/AuthStore';
export { EventAction } from './events/EventAction';
export { EventTypes } from './events/EventTypes';

/**
 * Note: Some request get blocked by the Browser because they are not allowed by HmSYS (cors)
 */
export class NetworkConnector
{
    readonly url: string
    private events: EventAction[] = []
    private socket: WebSocket | undefined = undefined;
    private auth: CustomProvider | undefined = undefined;
    api: Fetcher;
    rest: RestFetcher;
    constructor(url: string)
    {
        this.url = url;
        this.api = new Fetcher(() => this);
        this.rest = new RestFetcher(() => this);
    }

    /**
     * A Stupid register for every basic event. Use api.sync for better filtered data
     */
    event = (action: EventAction) => { this.events.push(action); return this }
    ajson = (data: any) => this.socket?.send(JSON.stringify({ ...data, auth: this.getAuth() }))
    json = (data: any) => this.socket?.send(JSON.stringify(data))
    raw = (data: any) => this.socket?.send(data)

    connect(auth: CustomProvider, firstTime = true)
    {
        return new Promise(done =>
        {
            this.socket = new WebSocket("wss://" + this.url);
            this.auth = auth;
            this.emitEvent(EventTypes.Connecting, { socket: this.socket })
            this.socket.onmessage = (x) =>
            {
                try
                {
                    const data = JSON.parse(x.data)
                    this.emitEvent(EventTypes.RawMessage, { data, socket: this.socket })
                    if (data.login == "require authentication")
                    {
                        this.emitEvent(EventTypes.TryingLogin, { socket: this.socket })
                        const relogin = auth.getReloginDetails();
                        if (relogin)
                            this.json({
                                action: "login",
                                type: "client",
                                token: relogin.token,
                                id: relogin.id
                            })
                        else
                            auth.requestNewLoginDetials(firstTime ? "missing-credentials" : "wrong-credentials").then(({ email, password }) =>
                                this.json({
                                    action: "login",
                                    type: "client",
                                    email,
                                    password
                                }))

                    } else if (data.login == false)
                    {
                        this.emitEvent(EventTypes.LoginFailed, { socket: this.socket })
                        auth.resetReloginDetails()
                        this.connect(auth, false)
                    } else if (data.login == true)
                    {
                        this.emitEvent(EventTypes.LoginSuccessful, { socket: this.socket, data })
                        auth.setReloginDetails(data.client)
                        done(data.client)
                    } else
                    {
                        this.emitEvent(EventTypes.Message, { socket: this.socket, data })
                    }
                } catch (error)
                {
                    console.error(error);
                }
            };
            this.socket.onopen = () => this.emitEvent(EventTypes.Conncted, { socket: this.socket })
            this.socket.onclose = () => this.emitEvent(EventTypes.Disconnected, { socket: this.socket })
            this.socket.onerror = () => this.emitEvent(EventTypes.Disconnected, { socket: this.socket })
        })
    }

    getAuth = () => this.auth?.getReloginDetails();

    private emitEvent(type: EventTypes, data: any)
    {
        this.events.filter(x => x.type == type).forEach(x => x.action(data))
        return this;
    }

}
