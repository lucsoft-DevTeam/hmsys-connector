import { LoginData } from './AuthStore';

export interface CustomProvider
{
    doesLoginExists: () => boolean
    newLoginDetials: () => Promise<LoginData>
}