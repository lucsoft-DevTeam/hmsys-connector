import { LoginData } from './AuthStore';
import { CustomProvider } from './CustomProvider';

export class LocalStorageProvider implements CustomProvider
{
    data: Promise<LoginData>
    constructor(data: Promise<LoginData>)
    {
        this.data = data;
    }

    doesLoginExists(): boolean
    {
        return false
    }

    newLoginDetials = () => this.data

}