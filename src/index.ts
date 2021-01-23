import { EventAction } from './events/EventAction';
import { EventTypes } from './events/EventTypes';
import { CustomProvider } from './store/CustomProvider';
export * as store from './store';
export * as events from './events';

export class NetworkConnector
{
    url: string
    events: EventAction[] = []
    constructor(url: string) { this.url = url }

    addEvent = (action: EventAction) => this.events.push(action)
    private emitEvent(type: EventTypes, data: any)
    {
        this.events.filter(x => x.eventType == type).forEach(x => x.eventAction(data))
    }
    registerToNetwork(auth: CustomProvider)
    {
        const socket = new WebSocket(this.url);
        this.emitEvent(EventTypes.Connecting, { socket })
        socket.onmessage = (x) =>
        {
            try
            {
                const data = JSON.parse(x.data)
                this.emitEvent(EventTypes.RawMessage, { data, socket })
                if (data.login == "require authentication")
                {
                    this.emitEvent(EventTypes.TryingLogin, { socket })
                    const relogin = auth.getReloginDetails();
                    if (relogin)
                        socket.send(JSON.stringify({
                            action: "login",
                            type: "client",
                            token: relogin.token,
                            id: relogin.id
                        }))
                    else
                        auth.requestNewLoginDetials().then(({ email, password }) =>
                            socket.send(JSON.stringify({
                                action: "login",
                                type: "client",
                                email,
                                password
                            })))

                } else if (data.login == false)
                {
                    this.emitEvent(EventTypes.LoginFailed, { socket })
                    auth.resetReloginDetails()
                    this.registerToNetwork(auth)
                } else if (data.login == true)
                {
                    this.emitEvent(EventTypes.LoginSuccessful, { socket, data })
                    auth.setReloginDetails(data.client)
                } else
                {
                    this.emitEvent(EventTypes.Message, { socket, data })
                }
            } catch (error)
            {
                console.error(error);
            }
        };
        socket.onopen = () => this.emitEvent(EventTypes.Conncted, { socket })
        socket.onclose = () => this.emitEvent(EventTypes.Disconnected, { socket })
        socket.onerror = () => this.emitEvent(EventTypes.Disconnected, { socket })
    }
}
