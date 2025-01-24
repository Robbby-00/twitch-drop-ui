import { useContext, useEffect, useState } from "react"

// context
import { DataContext } from "../../context/data"
import { OverlayContext } from "../../context/overlay"

// component
import { Button, ButtonStyle } from "../../components/button"
import { SearchOverlay } from "../../components/search-overlay"
import { TrackedCampaign } from "../../components/tracked-campaign"

// @types
import { ContentType, useApi } from "../../hooks/api/index"

// icon
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons"

// style
import "./campaigns.css"
import { ToggleButton } from "../../components/toggle-button"

export function CampaignsPage() {

    // context
    const { show } = useContext(OverlayContext)
    const { trackCampaign, servicesStatus } = useContext(DataContext)
    
    // hooks
    const { removeToTracking } = useApi()

    // state
    const [ isAvaiable, setIsAvaiable ] = useState<boolean>(true)
    const [ editMode, setEditMode ] = useState<boolean>(false)

    // constant
    const searchOverlay = <SearchOverlay type={ContentType.Campaign}/>

    useEffect(() => {
        setIsAvaiable(servicesStatus.campaigns === "avaiable")
    }, [servicesStatus])

    const handleAddCampaigns = () => {
        show(searchOverlay)
    }

    if (!isAvaiable) {
        return <div className="container-page">
            <div className="container-error">
                <div className="error-code">503</div>
                <div className="desc">Service Unavaiable</div>
            </div>
        </div>
    }

    return <div className="container-page">
        <div className="head">
            <div className="container-title">
                <span className="title">Active Campaigns</span>
            </div>
            <div className="action">
                <ToggleButton icon={faEdit} onToggleChange={(state) => setEditMode(state)} />
                <Button style={ButtonStyle.FILL} text="ADD CAMPAIGNS" icon={faPlus} onClick={handleAddCampaigns} disable={editMode} />
            </div>
        </div>
        <div className="campaigns">
            { 
                trackCampaign.length > 0 ? 
                trackCampaign.map((campaign, idx) => <TrackedCampaign key={idx} campaign={campaign} editMode={editMode} onDelete={() => {
                    removeToTracking(ContentType.Campaign, campaign.id).catch()
                }}/>) : 
                <div className="empty">No tracking any campaigns</div> 
            }
        </div>
    </div>
}