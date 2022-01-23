export type SyncAction = {
    type: string
    recivedData: (data: any) => void
}