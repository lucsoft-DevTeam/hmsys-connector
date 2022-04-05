export type Authentication = Partial<{ id: string; token: string }>;
export type HmRequest =
    | QueryRequest
    | LoginRequest
    | AccountRequest
    | TriggerRequest
    | SubscribeRequest;

export type HmResponse =
    | SyncResponse
    | ProfileResponse
    | LoginResponse
    | QueryResponse
    | PublishResponse;

export type PublishResponse = {
    type: "pub";
    id: string;
    data: Record<string, string>;
};
export type QueryResponse = {
    type: "query";
    response: string;
} & Record<string, unknown>;
export type LoginResponse = {
    login: true;
    id: undefined;
    type: "client";
    client: {
        email?: string;
        id: string;
        token: string;
    };
} | {
    id: undefined;
    type: "client";
    login: false;
    error: "forcedClosed";
};
export type ProfileResponse = {
    type: "profile";
    id?: string;
};
export type SyncResponse = {
    type: "sync";
    id?: string;
    data: Record<string, string>;
};
export type QueryRequest = {
    action: MessageType.Query;
    auth?: Authentication;
    type?: "userdata" | "modules";
    data?: {
        userId: string;
    };
};

export const enum MessageType {
    Login = "login",
    Account = "account",
    Trigger = "trigger",
    Query = "query",
    Subscribe = "sub",
}
export type LoginRequest =
    & {
        action: MessageType.Login;
        type?: "client";
    }
    & Partial<
        ({
            id: string;
            token: string;
            email: undefined;
            password: undefined;
        } | {
            id: undefined;
            token: undefined;
            email: string;
            password: string;
        })
    >;

export type AccountRequest = {
    action: MessageType.Account;
    auth?: Authentication;
    id?: string;
    type?: ("groupe" | "hmsys" | "services")[];
};

export type TriggerRequest = {
    action: MessageType.Trigger;
    auth?: Authentication;
    type?: string;
    targetId?: string;
    id?: string;
    data?: unknown;
};

export type SubscribeRequest = {
    action: MessageType.Subscribe;
    auth?: Authentication;
    id: string;
};
