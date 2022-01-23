import type { SignedInCredentials } from './AuthStore.ts';

export type CredentialsProvider = {
    getReloginDetails: () => SignedInCredentials | undefined
    resetReloginDetails: () => void
    setReloginDetails: (data: SignedInCredentials) => void
}