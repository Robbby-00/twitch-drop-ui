import { useEffect, useState } from "react"

// style
import "./input-toggle.css"

export function InputToggle(props: { value: boolean, onChange?: (value: boolean) => void }) {
    const { value, onChange } = props

    const [ displayValue, setDisplayValue ] = useState<boolean>(value)

    useEffect(() => {
        setDisplayValue(value)
    }, [value])

    useEffect(() => {
        if (onChange) {
            onChange(displayValue)
        }
    }, [displayValue])

    return <div className="container-toggle input-custom" data-toggle={displayValue} onClick={() => setDisplayValue(v => !v)}>
        <div className="handle" />
    </div>
}