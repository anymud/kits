import { addExtra } from "playwright-extra"
import { selectors, chromium } from "playwright"
// import { selectorEngine } from "query-selector-shadow-dom/plugins/playwright"
import stealth from "puppeteer-extra-plugin-stealth"
import { useLazy } from "../lazy"

export function createBrowser() {
    // selectors.register('shadow', selectorEngine)
    // const chromiumExtra = addExtra(chromium)
    // chromiumExtra.use(stealth())
    const runtimeConfig = useRuntimeConfig()
    return chromium.launch({
        headless: true,
        executablePath: runtimeConfig.browser.chromium.path,
        args: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-gl-drawing-for-tests'
        ]
    })
}

export const useBrowser = useLazy(() => {
    return createBrowser()
})

export async function fetchByBrowser(url: string) {
    try {
        const browser = await useBrowser()
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        const content = await page.content()
        // await browser.close()
        return content
    } catch (e) {
        console.error(e)
        throw e
    }
}