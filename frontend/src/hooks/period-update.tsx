import { useEffect, useRef, useState } from "react"

const DEFAULT_UPDATE_TIME = 2 * 60 * 1000   // 2min

function periodicUpdate<T>(updateFunc: () => Promise<[T, number]>, 
                        setState: React.Dispatch<React.SetStateAction<T>>, 
                        timeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
                        onRequest?: (success: boolean) => void) {
    let update: number = DEFAULT_UPDATE_TIME
    updateFunc().then(([data, nextUpdate]) => {
        setState(data)
        update = nextUpdate
        
        if (onRequest) {
            onRequest(true)
        }
    })
    .catch(() => onRequest && onRequest(false))
    .finally(() => {
        timeoutRef.current = setTimeout(() => periodicUpdate<T>(updateFunc, setState, timeoutRef, onRequest), update)
    })
}

export function usePeriodUpdate<T>(updateFunc: () => Promise<[T, number]>, defaultValue: T, onRequest?: (success: boolean) => void) {

    // states
    const [ data, setData ] = useState<T>(defaultValue)

    // timeoutRef
    const timeout = useRef<NodeJS.Timeout | undefined>()

    const forceUpdateData = () => {
        updateFunc().then(raw => {
            const [ data, _ ] = raw
            setData(data)

            if (onRequest) {
                onRequest(true)
            }
        }).catch(() => onRequest && onRequest(false))
    }

    const unmount = () => {
        if (timeout.current !== undefined) {
            clearTimeout(timeout.current)
        }
    }

    useEffect(() => {
        periodicUpdate<T>(updateFunc, setData, timeout, onRequest)
        return unmount
    }, [])

    return {
        data,
        forceUpdateData
    }
}