export type Authentication = Partial<{ id: string, token: string }>;
export type Message = QueryRequest | LoginRequest | AccountRequest | TriggerRequest;

export type QueryRequest = {
    action: MessageType.Query
    auth?: Authentication,
    type?: "userdata" | "modules"
    data?: {
        userId: string
    }
}

export const enum MessageType {
    Login = "login",
    Account = "account",
    Trigger = "trigger",
    Query = "query"
}

export type LoginRequest = {
    action: MessageType.Login
    type?: 'client'
} & Partial<({
    id: string,
    token: string,
    email: undefined,
    password: undefined
} | {
    id: undefined,
    token: undefined
    email: string,
    password: string
})>

export type AccountRequest = {
    action: MessageType.Account
    auth?: Authentication
    id?: string,
    type?: ('groupe' | 'hmsys' | 'services')[]
}

export type TriggerRequest = {
    action: MessageType.Trigger
    auth?: Authentication
    type?: string
    targetId?: string
    id?: string,
    data?: unknown
}