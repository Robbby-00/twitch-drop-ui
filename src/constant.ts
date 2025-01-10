import { executablePath } from 'puppeteer'
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

export const STORAGE_DIR: string = process.env.STORAGE_DIR !== undefined ? process.env.STORAGE_DIR : "./data"

// Generate data folder
if (!existsSync(STORAGE_DIR)) 
    mkdirSync(STORAGE_DIR)

// Logger
export const PATH_LOGFILE = join(STORAGE_DIR, './log.txt')

// Api
export const API_PORT = process.env.API_PORT ?? 17472

// Tracker
export const PATH_TRACKERFILE = join(STORAGE_DIR, './tracker.json')
export const UPDATE_INTERVAL = 120              // in seconds
export const CLAIM_INTERVAL = 300               // in seconds

// Watcher
export const WATCH_INTERVAL = 10    // in seconds
export const MAX_WATCH_ERROR = 3    // error after the streams is considered offline

// User
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN
export const MAX_INTEGRITY_RETRY = 3

// Browser
export const PATH_USERFILE = join(STORAGE_DIR, './user_data')
export const CHROME_BINARY = process.env.CHROME_BINARY ?? executablePath()
export const HEADLESS = process.env.HEADLESS ? process.env.HEADLESS.toLowerCase() === 'true' : true
export const STEALTH_MODE = process.env.STEALTH_MODE ? process.env.STEALTH_MODE.toLowerCase() === 'true' : true
export const BLOCK_TRACKER = process.env.BLOCK_TRACKER ? process.env.BLOCK_TRACKER.toLowerCase() === 'true' : true
export const BROWSER_TEST = process.env.BROWSER_TEST ? process.env.BROWSER_TEST.toLowerCase() === 'true' : false

if (ACCESS_TOKEN === undefined) {
    throw new Error("Missing access token!")
}