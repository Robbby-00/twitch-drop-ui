import EventEmitter from "node:events";
import { SettingKeys } from "./@type";


export type SettingEventType = {
    [K in SettingKeys]: [value: any]
}

export class SettingEventEmitter<T extends Record<string, any>> {
    private emitter = new EventEmitter()

    emit<TEventName extends keyof T & string>(
        eventName: TEventName,
        ...eventArg: T[TEventName]
      ) {
        this.emitter.emit(eventName, ...(eventArg as []))
      }
    
      on<TEventName extends keyof T & string>(
        eventName: TEventName,
        handler: (...eventArg: T[TEventName]) => void
      ) {
        this.emitter.on(eventName, handler as any)
      }
    
      off<TEventName extends keyof T & string>(
        eventName: TEventName,
        handler: (...eventArg: T[TEventName]) => void
      ) {
        this.emitter.off(eventName, handler as any)
      }
}