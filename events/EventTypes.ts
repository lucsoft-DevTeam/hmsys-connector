export const enum EventTypes {
    Connecting,
    Conncted,
    Disconnected,
    TryingLogin,
    LoginFailed,
    CredentialsRequired,
    LoginSuccessful,
    RawMessage,
    Message
}

export const enum RejectTypes {
    Timeout
}