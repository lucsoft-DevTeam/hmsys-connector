import { EventTypes } from './EventTypes';

export type EventAction = (data: any) => void;
export type Events = { type: EventTypes, action: (data: any) => void };