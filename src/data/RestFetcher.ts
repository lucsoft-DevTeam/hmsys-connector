import type { NetworkConnector } from '..';

export class RestFetcher {
    private hmsys: () => NetworkConnector;
    http: boolean;
    constructor(hmsys: () => NetworkConnector, http: boolean) {
        this.http = http;
        this.hmsys = hmsys;
    }

    get(id: string, path: string) {
        const auth = this.hmsys().getAuth();
        return fetch(`http${this.http ? '' : 's'}://${this.hmsys().url}/api/${id}/${path}`, {
            headers: new Headers({
                'Authorization': 'Basic ' + btoa(`${auth!.id}:${auth!.token}`),
            })
        })
    }
}