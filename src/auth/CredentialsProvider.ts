import type { SignedInCredentials } from './AuthStore';

export type CredentialsProvider = {
    getReloginDetails: () => SignedInCredentials | undefined
    resetReloginDetails: () => void
    setReloginDetails: (data: SignedInCredentials) => void
}