import type { SignedInCredentials } from './AuthStore';
import type { CredentialsProvider } from './CredentialsProvider';

export const saveInLocalStorageProvider = (): CredentialsProvider => ({
    getReloginDetails: () => {
        return localStorage[ "nc-ls-auth" ] ? JSON.parse(localStorage[ "nc-ls-auth" ]) : undefined
    },
    setReloginDetails: (data: SignedInCredentials) => localStorage[ "nc-ls-auth" ] = JSON.stringify(data),
    resetReloginDetails: () => localStorage.removeItem("nc-ls-auth")
})