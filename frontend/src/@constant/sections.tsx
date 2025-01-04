import { ReactNode } from "react"
import { PointsPage } from "../pages/points"
import { CampaignsPage } from "../pages/campaigns"
import { TrackingGamePage } from "../pages/game-tracking"

export interface Section {
    displayName: string
    pathName: string
    element: ReactNode
}

export const sections: Section[] = [{
    displayName: "Channel Points",
    pathName: "points",
    element: <PointsPage />
}, {
    displayName: "Campaigns",
    pathName: "drop",
    element: <CampaignsPage />
}, {
    displayName: "Tracking Game",
    pathName: "game",
    element: <TrackingGamePage />
}]