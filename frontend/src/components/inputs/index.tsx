// component
import { InputNumber } from "./number"

// style
import "./input-global.css"
import { InputToggle } from "./toggle"

interface InputDefaultProps {
    type: string
    value?: any
    onChange?: (value: any) => void
}

interface InputNumberProps {
    type: "number"
    value: number
    onChange?: (value: number) => void
}

export type InputProps = InputDefaultProps | InputNumberProps

export function Input(props: InputProps) {
    const { type, onChange } = props

    switch (type) {
        case "number":
            return <InputNumber value={props.value} onChange={onChange} />
        case "boolean":
            return <InputToggle value={props.value} onChange={onChange} />
        default:
            return <></>
    }
}