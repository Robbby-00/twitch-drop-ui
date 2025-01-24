import { useContext } from "react"
import parse from 'html-react-parser';

// context
import { IContextSetting, SettingContext } from "../../../../../context/setting"

// components
import { Input } from "../../../../inputs"
import { InputSelect } from "../../../../inputs/select"

// style
import "./setting-entry.css"

export function SettingEntry(props: { setting: IContextSetting }) {
    const { setting } = props

    // context
    const { updateToApplyValue } = useContext(SettingContext)

    const handleUpdateValue = (value: any) => {
        updateToApplyValue(setting.key, value)
    }

    return <div className="setting-entry">
        <div className="header">
            <div className="title">
                {setting.displayName}
                <div className="tags">
                    <div className="tag not-apply" data-show={setting.toApplyValue !== setting.value}>Not Apply</div>
                </div>
            </div>
            <div className="value">
                { setting.options ?  
                    <InputSelect value={setting.toApplyValue} options={setting.options} active={setting.value} onChange={handleUpdateValue}/> : 
                    <Input type={setting.__type} value={setting.toApplyValue} onChange={handleUpdateValue}/> 
                }
            </div>
        </div>
        <div className="desc">
            {parse(setting.desc)}
        </div>
    </div>
}