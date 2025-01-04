import { Mutex } from "async-mutex";

export function mutex(mutex: Mutex) {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
    
        descriptor.value = function (...args: any[]) {
            return mutex.runExclusive(() => originalMethod.apply(this, args))
        };
    
        return descriptor;
    }
}