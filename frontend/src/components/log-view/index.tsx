// style
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./log-view.css"
import { faChevronUp } from "@fortawesome/free-solid-svg-icons"

export function LogView(props: {}) {
    const {} = props

    const renderLog = () => {

        return <>
            <div className="timestamp">23:26 47.257ms</div>
            <div className="tag">Tracker</div>
            <div className="text">Updating Watchers...</div>
        </>
    }

    return <div className="container-log-view">
        <div className="logs">
            <div className="item secondary">
                 { renderLog() }
            </div>
            <div className="item primary">
                 { renderLog() }
            </div>
        </div>
        <div className="expand">
            <FontAwesomeIcon icon={faChevronUp} />
        </div>
    </div>
}
