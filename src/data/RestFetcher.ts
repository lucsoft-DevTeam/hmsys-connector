import type { NetworkConnector } from '..';

export class RestFetcher
{
    private hmsys: () => NetworkConnector;
    constructor(hmsys: () => NetworkConnector)
    {
        this.hmsys = hmsys;
    }

    get(id: string, path: string)
    {
        const auth = this.hmsys().getAuth();
        return fetch(`https://${this.hmsys().url}/api/${id}/${path}`, {
            headers: new Headers({
                'Authorization': 'Basic ' + btoa(`${auth!.id}:${auth!.token}`),
            })
        })
    }
}