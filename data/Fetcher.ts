import { EventTypes, RejectTypes } from '../events/EventTypes.ts';
import { SyncAction } from "../events/SyncTypes.ts";
import type { NetworkConnector } from "../mod.ts";
import { TriggerRequest, MessageType } from "../spec/ws.ts";

export class Fetcher {
    private hmsys: () => NetworkConnector;
    private counter = 0;
    private syncEvents: SyncAction[] = []
    private eventsHolder: { [ type in string ]: (message: TriggerRequest) => void } = {};
    constructor(hmsys: () => NetworkConnector) {
        this.hmsys = hmsys;
        this.hmsys().rawOn(
            EventTypes.Message,
            ({ data }) => Object.keys(this.eventsHolder).forEach(x => this.eventsHolder[ x ](data))
        )
        this.hmsys().rawOn(
            EventTypes.Message,
            ({ data }) => {
                if (data.type !== "sync") return;
                this.syncEvents.filter(x => x.type == data.data.type).forEach(x => x.recivedData(data.data))
            }
        )
    }

    requestUserData(...data: ("profile" | "groupe" | "hmsys" | "services")[]) {
        return this.customRequest({ action: "account", type: data } as unknown as TriggerRequest)
    }

    sync = (type: string, recivedData: (data: unknown) => void) => {
        this.syncEvents.push({ type, recivedData });
        return this
    }

    customRequest(initialRequest: TriggerRequest) {
        return new Promise((resolve, reject) => {
            const id = (this.counter++).toString()
            const timeout = setTimeout(() => {
                reject(RejectTypes.Timeout)
            }, this.hmsys().timeout)

            this.hmsys().sendWithAuth({
                id,
                ...initialRequest
            })

            this.eventsHolder[ id ] = (data) => {
                if (data.id === id) {
                    clearTimeout(timeout)
                    resolve(data)
                    delete this.eventsHolder[ id.toString() ]
                }
            }
        })
    }

    trigger(id: string, data: TriggerRequest) {
        this.hmsys().sendWithAuth({
            id,
            action: MessageType.Trigger,
            type: id,
            data
        })
    }

    triggerWithResponse(id: string, data: TriggerRequest) {
        return this.customRequest({
            action: MessageType.Trigger,
            type: id,
            data
        })
    }
}