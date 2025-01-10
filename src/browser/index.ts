import puppeteer, { Browser, Cookie, Page } from 'puppeteer'
import puppeteerExtra from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import AdBlockerPlugin from "puppeteer-extra-plugin-adblocker"

// components
import { AuthUser } from "../twitch/auth"

// @types
import { IIntegrityToken } from "./@types"

// @constant
import { CHROME_BINARY, PATH_USERFILE, HEADLESS, STEALTH_MODE, BLOCK_TRACKER } from '../constant'

if (STEALTH_MODE) {
    puppeteerExtra.use(StealthPlugin())
}

if (BLOCK_TRACKER) {
    puppeteerExtra.use(AdBlockerPlugin({ blockTrackers: true }))
}

export class BrowserInstance {
    private static launch(useragent: string): Promise<Browser> {
        return puppeteer.launch({
            headless: HEADLESS,
            executablePath: CHROME_BINARY,
            userDataDir: PATH_USERFILE,
            ignoreDefaultArgs: ['--enable-automation'],
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--disable-blink-features=AutomationControlled',
                '--enable-blink-feautres=IdleDetection',
                '--disable-extensions',
                '--disable-infobars',
                `--user-agent=${useragent}`
            ],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        })
    }

    private static async getPage(browser: Browser): Promise<Page> {
        const pages = await browser.pages()

        if (pages.length > 0) {
            return pages[0]
        }
        
        return await browser.newPage()
    }

    private static createCookie(name: string, value: string): Cookie {
        return {
            name: name, 
            value: value, 
            domain: ".twitch.tv",
            expires: -1,
            httpOnly: false,
            path: "/",
            secure: true,
            session: false,
            size: value.length
        }
    }

    private static _timeout(delay: number): Promise<undefined> {
        return new Promise(resolve => setTimeout(() => resolve(undefined), delay))
    }

    private static _getIntegrityToken(browser: Browser): Promise<IIntegrityToken | undefined> {
        return new Promise<IIntegrityToken | undefined>(async resolve => {
            try {
                if (AuthUser.accessToken !== undefined) {
                    browser.setCookie(this.createCookie("auth-token", AuthUser.accessToken))
                }
        
                if (AuthUser.deviceId !== undefined) {
                    browser.setCookie(this.createCookie("unique_id", AuthUser.deviceId))
                    browser.setCookie(this.createCookie("unique_id_durable", AuthUser.deviceId))
                }
        
                const page = await this.getPage(browser)
                
                page.on('response', resp => {
                    if (resp.url() === "https://gql.twitch.tv/integrity") {
                        const request = resp.request()
                        if (request.method() === "OPTIONS" && request.headers()['access-control-request-method']) {
                            // is a preflight request skip
                            return
                        }

                        resp.json().then(resolve)
                    }
                })

                await page.goto("https://www.twitch.tv/")
                if (AuthUser.deviceId === undefined) {
                    let cookies = await browser.cookies()
                    let deviceIdCookie = cookies.find(it => it.name === "unique_id")
                    if (deviceIdCookie) {
                        AuthUser.deviceId = deviceIdCookie.value
                    }
                }
            } catch (err) {
                console.log(err)
                return undefined   
            }
        })
    }

    public static async getIntegrityToken(): Promise<IIntegrityToken | undefined> {
        const browser = await this.launch(AuthUser.clientInfo.userAgent)

        let result = await Promise.race([
            this._getIntegrityToken(browser),
            this._timeout(30000)
        ])

        browser.close()
        return result
    }

    public static async test(): Promise<void> {
        const browser = await this.launch(AuthUser.clientInfo.userAgent)

        const page = await this.getPage(browser)
        await page.goto("https://deviceandbrowserinfo.com/are_you_a_bot")
        // await page.goto("https://hmaker.github.io/selenium-detector/");
        // await page.goto("https://bot-detector.rebrowser.net/");
        // await page.goto("https://www.browserscan.net/bot-detection");
        

        await new Promise(resolve => {})
    }
}