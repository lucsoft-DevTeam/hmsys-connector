import type { SignedInCredentials } from './AuthStore.ts';
import type { CredentialsProvider } from './CredentialsProvider.ts';

export const saveInLocalStorageProvider = (): CredentialsProvider => ({
    getReloginDetails: () => localStorage[ "nc-ls-auth" ] ? JSON.parse(localStorage[ "nc-ls-auth" ]) : undefined,
    setReloginDetails: (data: SignedInCredentials) => localStorage[ "nc-ls-auth" ] = JSON.stringify(data),
    resetReloginDetails: () => localStorage.removeItem("nc-ls-auth")
})