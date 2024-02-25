import { useBrowser } from "../browser"

interface svgOptions {
  useBrowser?: boolean
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit" | undefined
}

export async function parseSvg(svg: string, options?: svgOptions) {
  if (!options?.useBrowser)
    return Buffer.from(svg)

  const browser = await useBrowser()
  const page = await browser.newPage()
  await page.setContent(`${svg}<style>html, body { padding: 0; margin: 0 }</style>`, {
    waitUntil: options?.waitUntil,
  })
  const buffer = await page.screenshot({
    fullPage: true,
  }) as Buffer
  await page.close()
  return buffer
}
