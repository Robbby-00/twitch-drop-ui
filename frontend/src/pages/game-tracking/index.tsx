import { useContext, useState } from "react"

// context
import { OverlayContext } from "../../context/overlay"
import { DataContext } from "../../context/data"

// hooks
import { ContentType, useApi } from "../../hooks/api"

// components
import { SearchOverlay } from "../../components/search-overlay"
import { ToggleButton } from "../../components/toggle-button"
import { Button, ButtonStyle } from "../../components/button"
import { TrackedGame } from "../../components/tracked-game"

// icons
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons"

// style
import "./game-tracking.css"


export function TrackingGamePage() {

    // context
    const { show } = useContext(OverlayContext)
    const { trackGame } = useContext(DataContext)

    // state
    const [ editMode, setEditMode ] = useState<boolean>(false)

    // hooks
    const { removeToTracking } = useApi()

    const searchOverlay = <SearchOverlay type={ContentType.Game}/>

    const handleAddGame = () => {
        show(searchOverlay)
    }

    return <div className="container-page">
        <div className="head">
            <div className="container-title">
                <span className="title">Tracking Game</span>
            </div>
            <div className="action">
                <ToggleButton icon={faEdit} onToggleChange={(state) => setEditMode(state)} />
                <Button style={ButtonStyle.FILL} text="ADD GAME" icon={faPlus} onClick={handleAddGame} disable={editMode} />
            </div>
        </div>
        <div className="games">
            { 
                trackGame.length > 0 ? 
                trackGame.map((game, idx) => <TrackedGame key={idx} game={game} editMode={editMode} onDelete={() => {
                    removeToTracking(ContentType.Game, game.slug).catch()
                }}/>) : 
                <div className="empty">No tracking any game</div> 
            }
        </div>
    </div>
}