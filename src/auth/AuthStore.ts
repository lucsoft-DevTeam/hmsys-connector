export type LoginData = {
    email: string
    password: string
}

export type ReloginData = {
    id: string;
    token: string;
}

export type ResponseTypeOfLoginRequest = "wrong-credentials" | "missing-credentials";