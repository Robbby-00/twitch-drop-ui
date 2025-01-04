import puppeteer, { Browser, Cookie, Page } from 'puppeteer-core'
import puppeteerExtra from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import AdBlockerPlugin from "puppeteer-extra-plugin-adblocker"
import { executablePath } from 'puppeteer'

// components
import { AuthUser } from "../twitch/auth"

// @types
import { IIntegrityToken } from "./@types"

// @constant
import { CHROME_BINARY, PATH_USERFILE } from '../constant'

puppeteerExtra.use(StealthPlugin())
puppeteerExtra.use(AdBlockerPlugin({ blockTrackers: true }))

export class BrowserInstance {

    private static launch(): Promise<Browser> {
        return puppeteer.launch({
            headless: true,
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
                '--disable-infobars'
            ],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        })
    }

    private static async getUndetectedPage(browser: Browser, useragent: string): Promise<Page> {
        const page = (await browser.pages())[0]

        let userAgent = page.setUserAgent(useragent)
        let extraHeader = page.setExtraHTTPHeaders({
            "Accept-Language": 'en-US,en;q=0.9',
            "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            "Sec-Ch-Ua-Mobile": '?0',
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": 'empty',
            "Sec-Fetch-Mode": 'cors',
            "Sec-Fetch-Site": 'same-site'
        })

        await Promise.all([userAgent, extraHeader])

        /*await page.evaluateOnNewDocument(() => {
            // @ts-ignore
            const getParameter = WebGLRenderingContext.prototype.getParameter;

            // @ts-ignore
            WebGLRenderingContext.prototype.getParameter = function (parameter) {
                if (parameter === 37445) return 'Intel Inc.';
                if (parameter === 37446) return 'Intel Iris OpenGL Engine';
                
                return getParameter(parameter);
            };
            
            // @ts-ignore
            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
            
            // @ts-ignore
            Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
            
            // @ts-ignore
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        
            // @ts-ignore
            Object.defineProperty(navigator, 'platform', {
                get: () => 'Win32',
            });
        })*/

        return page
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
        
                const page = await this.getUndetectedPage(browser, AuthUser.clientInfo.userAgent)
                
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
        const browser = await this.launch()

        let result = await Promise.race([
            this._getIntegrityToken(browser),
            this._timeout(15000)
        ])

        browser.close()
        return result
    }

    public static async test(): Promise<void> {
        const browser = await this.launch()

        const page = await this.getUndetectedPage(browser, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        await page.goto("https://deviceandbrowserinfo.com/are_you_a_bot")

        await new Promise(resolve => {})
    }
}