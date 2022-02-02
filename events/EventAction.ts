import { HmResponse } from "../mod.ts";
import { EventTypes } from './EventTypes.ts';

export type EventAction = (data: { socket?: WebSocket, data?: HmResponse }) => void;
export type Events = { type: EventTypes, action: (data: { socket?: WebSocket, data?: HmResponse }) => void };