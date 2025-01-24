import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"

// context
import { OverlayContext } from "../../context/overlay"
import { DataContext } from "../../context/data"

// component
import { SearchOverlay } from "../../components/search-overlay"
import { TrackedChannel } from "../../components/tracked-channel"
import { Tooltip } from "../../components/tooltip"
import { Button, ButtonStyle } from "../../components/button"
import { ToggleButton } from "../../components/toggle-button"

// @types
import { ContentType, useApi } from "../../hooks/api"

// icons
import { faEdit, faPlus, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

// style
import "./points.css"

const WARNING_HIGH_TRACKING_MESSAGE = <>You are tracking more than <strong>15 channels</strong>. <br/>This increases traffic to Twitch's APIs, and the <strong>developer assumes no responsibility</strong> in case of account bans or suspensions. <br/><br/><strong>Recommendation</strong>: Do not exceed 15 tracked channels.</>

export function PointsPage() {

    // context
    const { show } = useContext(OverlayContext)
    const { trackChannel } = useContext(DataContext)

    // state
    const [ editMode, setEditMode ] = useState<boolean>(false)

    // hooks
    const { removeToTracking } = useApi()

    const searchOverlay = <SearchOverlay type={ContentType.Channel}/>

    const handleAddChannel = () => {
        show(searchOverlay)
    }

    return <div className="container-page">
        <div className="head">
            <div className="container-title">
                <span className="title">Active Channels</span>
                { trackChannel.length > 15 ? <Tooltip content={WARNING_HIGH_TRACKING_MESSAGE}>
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                </Tooltip> : "" }
            </div>
            <div className="action">
                <ToggleButton icon={faEdit} onToggleChange={(state) => setEditMode(state)} />
                <Button style={ButtonStyle.FILL} text="ADD CHANNEL" icon={faPlus} onClick={handleAddChannel} disable={editMode} />
            </div>
        </div>
        <div className="channels">
            { 
                trackChannel.length > 0 ? 
                trackChannel.map((channel, idx) => <TrackedChannel key={idx} channel={channel} editMode={editMode} onDelete={() => {
                    removeToTracking(ContentType.Channel, channel.login).catch()
                }}/>) : 
                <div className="empty">No tracking any channels</div> 
            }
        </div>
    </div>
}