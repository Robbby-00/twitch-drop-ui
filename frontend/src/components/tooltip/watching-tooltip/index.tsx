// components
import { Tooltip } from "..";
import { ProfileImage } from "../../profile-image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// icon
import { faEye } from "@fortawesome/free-solid-svg-icons";

// @types
import { IChannelExtended } from "../../../hooks/api/@type/channel";

// style
import "./watching-tooltip.css"

export function WatchingTooltip(props: { channel: IChannelExtended }) {

    const { channel } = props

    const renderWatchedChannel = () => {
        return <div className="content">
            <ProfileImage profileImage={channel.profileImage} isLive={channel.stream !== undefined}/>
            <a href={`https://www.twitch.tv/${channel.login}`} target="_blank">
                <span className="name">{channel.displayName}</span>
            </a>
        </div>
    }

    return <Tooltip className="watching" content={renderWatchedChannel()} position="right">
        <FontAwesomeIcon icon={faEye} />
    </Tooltip>
}