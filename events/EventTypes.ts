export const enum EventTypes {
    Connecting,
    Conncted,
    Disconnected,
    TryingLogin,
    LoginFailed,
    CredentialsRequired,
    Reconnect,
    LoginSuccessful,
    RawMessage,
    Message
}

export const enum RejectTypes {
    Timeout
}