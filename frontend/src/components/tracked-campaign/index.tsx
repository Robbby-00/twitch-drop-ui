import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

// context
import { DataContext } from "../../context/data";

// components
import { Button, ButtonStyle } from "../button";

// @types
import { ICampaign } from "../../hooks/api/@type/campaign";
import { IChannelExtended } from "../../hooks/api/@type/channel";

// utils
import { formatDateTime } from "../../utils";

// icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faChevronDown, faShareFromSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

// style
import "./tracked-campaign.css"
import { Drop } from "../drops";
import { WatchingTooltip } from "../tooltip/watching-tooltip";

export function TrackedCampaign(props: { campaign: ICampaign, editMode: boolean, onDelete?: () => void }) {

    const { campaign, editMode, onDelete } = props

    // context
    const { watchingChannel } = useContext(DataContext)

    // hooks
    const location = useLocation()
    const naviagate = useNavigate()

    // state
    const [ watching, setWatching ] = useState<IChannelExtended | undefined>(undefined)
    const [ expanded, setExpanded ] = useState<boolean>(false)
    const [ currentDrop, setCurrentDrop ] = useState<number>(0)
    const [ totalDrop, setTotalDrop ] = useState<number>(0)

    // ref
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let totalDrop = 0
        let currentDrop = 0
        for (let drop of campaign.drops) {
            totalDrop += drop.benefits.length
            if (drop.isClaimed) {
                currentDrop += drop.benefits.length
            }
        }

        setTotalDrop(totalDrop)
        setCurrentDrop(currentDrop)
    }, [campaign])

    useEffect(() => {
        let channelWatching = watchingChannel.find(ch => ch.campaign.some(c => c.id === campaign.id))?.channel
        setWatching(channelWatching)
    }, [campaign, watchingChannel])

    useEffect(() => {
        if (location.hash === `#${campaign.id}`) {
            setExpanded(true)

            if (!expanded) {
                // auto scroll to center
                setTimeout(() => {
                    containerRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    })
                }, 300)
            }
        }else setExpanded(false)
    }, [campaign, location])

    const handleToggleExpanded = () => {
        if (!expanded) {
            naviagate(`${location.pathname}#${campaign.id}`)
        }else naviagate(`${location.pathname}`)
    }

    const renderEditsButton = () => {
        return <div className="edits-button">
            <Button style={ButtonStyle.EMPTY} classname="remove" icon={faTrash} onClick={onDelete}/>
        </div>
    }

    return <div ref={containerRef} className="container-tracked-campaign" data-expanded={expanded}>
        <div className="header">
            <div className="info">
                <img className="box-art" src={campaign.game.boxArtURL} />
                <div className="container-data">
                    <div className="name">
                        {campaign.name}
                        {watching ? <WatchingTooltip channel={watching} /> : null}
                    </div>
                    <div className="tags">
                        <div className="tag game">
                            {campaign.game.displayName}
                        </div>
                        <div className="tag status">
                            <div className="container" data-status={campaign.status}>{campaign.status.toLowerCase()}</div>
                        </div>
                        { campaign.self.isAccountConnected ? 
                            <Button classname="tag account" style={ButtonStyle.FILL} text={"Connected"} clickable={false} /> :
                            <Button classname="tag account" style={ButtonStyle.EMPTY} text={"Connect"} icon={faShareFromSquare} onClick={() => window.open(campaign.accountLinkURL, "_blank")}/>  
                        }
                        <div className="tag expired">
                            <div className="container">
                                <span className="text">Expire:</span>
                                {formatDateTime(campaign.endAt)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="right-side">
                <div className="drop-recap">
                    { currentDrop !== totalDrop ? <>
                        <span className="current">{currentDrop}</span>
                        <span className="total">{`/${totalDrop}`}</span>
                    </> : <FontAwesomeIcon icon={faCheckCircle} />}
                </div>
                { editMode ? renderEditsButton() : <div className="expand-btn" onClick={handleToggleExpanded}>
                    <FontAwesomeIcon icon={faChevronDown} />
                </div> }
            </div>
        </div>
        <div className="spacer" />
        <div className="expanded-area">
            { campaign.drops.map((drop, idxDrop) => drop.benefits.map((benefit, idxBenfit) => {
                return <Drop key={(idxDrop * 1000) + idxBenfit} benefit={benefit} isClaimed={drop.isClaimed} minutesWatched={drop.minutesWatched} totalMinutes={drop.requiredMinutesWatched}/>
            })).flat() }
        </div>
    </div>
}