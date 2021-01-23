import { LoginData, ReloginData } from './AuthStore';

export type CustomProvider =
    {
        getReloginDetails: () => ReloginData | undefined
        resetReloginDetails: () => void
        setReloginDetails: (data: ReloginData) => void
        requestNewLoginDetials: () => Promise<LoginData>
    }