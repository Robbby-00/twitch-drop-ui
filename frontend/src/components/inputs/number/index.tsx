import { useEffect, useState } from "react"

// style
import "./input-number.css"

export function InputNumber(props: { value: number, onChange?: (value: number) => void }) {
    const { value, onChange } = props

    const [ displayValue, setDisplayValue ] = useState<number>(value)

    useEffect(() => {
        setDisplayValue(value)
    }, [value])

    useEffect(() => {
        if (onChange) {
            onChange(displayValue)
        }
    }, [displayValue])

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayValue(Number(evt.currentTarget.value))
    }

    return <input className="input-custom number" type="number" value={displayValue} onChange={handleChange}/>
}