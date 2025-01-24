export type EventCallback<T = any> = (data: T) => void;

export class EventEmitter<T extends Record<string, any>> {
    private events: Map<keyof T, EventCallback<any>[]> = new Map();

    on<K extends keyof T>(eventName: K, callback: EventCallback<T[K]>): void {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName)!.push(callback);
    }

    off<K extends keyof T>(eventName: K, callback: EventCallback<T[K]>): void {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
            this.events.set(eventName, callbacks.filter(cb => cb !== callback));
        }
    }

    emit<K extends keyof T>(eventName: K, data: T[K]): void {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
}