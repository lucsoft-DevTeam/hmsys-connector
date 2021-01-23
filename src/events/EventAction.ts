import { EventTypes } from './EventTypes';

export type EventAction = { type: EventTypes, action: (data: any) => void };