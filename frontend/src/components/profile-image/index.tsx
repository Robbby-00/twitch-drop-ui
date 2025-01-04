// style
import "./profile-image.css"

export function ProfileImage(props: { profileImage: string, isLive?: boolean }) {

    const { profileImage, isLive } = props

    return <div className="profile-image" data-islive={isLive ? isLive : false}>
        <div className="container-image">
            <img src={profileImage} />
        </div>
        <div className="live-badge">LIVE</div>
    </div>
}