import { EventAction } from './events/EventAction';
import { EventTypes } from './events/EventTypes';
import { CustomProvider } from './store/CustomProvider';
export { createLocalStorageProvider } from './store/LocalStorageProvider';
export { CustomProvider } from './store/CustomProvider';
export { LoginData, ReloginData } from './store/AuthStore';
export { EventAction } from './events/EventAction';
export { EventTypes } from './events/EventTypes';

export class NetworkConnector
{
    url: string
    events: EventAction[] = []
    socket: WebSocket | undefined = undefined;
    auth: CustomProvider | undefined = undefined;
    constructor(url: string) { this.url = url }

    event = (action: EventAction) => { this.events.push(action); return this }
    ajson = (data: any) => this.socket?.send(JSON.stringify({ ...data, auth: this.getAuth() }))
    json = (data: any) => this.socket?.send(JSON.stringify(data))
    raw = (data: any) => this.socket?.send(data)

    connect(auth: CustomProvider)
    {
        this.socket = new WebSocket(this.url);
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
                        auth.requestNewLoginDetials().then(({ email, password }) =>
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
                    this.connect(auth)
                } else if (data.login == true)
                {
                    this.emitEvent(EventTypes.LoginSuccessful, { socket: this.socket, data })
                    auth.setReloginDetails(data.client)
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
        return this;
    }

    getAuth = () => this.auth?.getReloginDetails();

    private emitEvent(type: EventTypes, data: any)
    {
        this.events.filter(x => x.type == type).forEach(x => x.action(data))
        return this;
    }
}
