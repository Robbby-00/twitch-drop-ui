import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number) {

    const [ debounceValue, setDebounceVlaue ] = useState<T>(value)

    const forceValue = (value: T) => {
        setDebounceVlaue(value)
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceVlaue(value);
        }, delay);

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return { debounceValue, forceValue }
}