import { EventTypes } from './EventTypes';

export type EventAction = { eventType: EventTypes, eventAction: (data: any) => void };