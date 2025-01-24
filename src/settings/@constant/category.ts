import { ICategory } from "../@type"

export const LIST_CATEGORY = new Map<string, ICategory>()

const addCategory = (category: ICategory): void => {
    LIST_CATEGORY.set(category.key, category)
}

export const appereanceCategory = {
    key: "appereance",
    displayName: "Appereance"
}
export const trackerCategory = {
    key: "tracker",
    displayName: "Tracker"
}
export const watcherCategory = {
    key: "watcher",
    displayName: "Watcher"
}

addCategory(appereanceCategory)
addCategory(trackerCategory)
addCategory(watcherCategory)