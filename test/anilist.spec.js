const puppeteer = require("puppeteer")
const { port } = require("../jest-puppeteer.config").server

const testRoot = `http://localhost:${port}/testAnilist`

jest.setTimeout(30000)

describe("Anilist Source Plugin", () => {
  let browser = ""
  let page = ""

  beforeAll(async () => {
    browser = await puppeteer.launch({args: ["--no-sandbox", "--disable-setuid-sandbox"]})
    page = await browser.newPage()

    page.emulate({
      viewport: {
	width: 500,
	height: 2400
      },
      userAgent: ""
    })

    await page.goto(testRoot)
  })

  afterAll(async () => {
    browser.close()
  })

  const getData = async () => {
    const rawText = await page.$eval("#test-data", e => e.innerHTML )
    return JSON.parse(rawText)
  }

  test("Site title tag matches expected (test page exists)", async () => {
    const t = await page.title()
    expect(t).toBe("gatsby-source-anilist test page")
  })

  test("Inner HTML is parseable JSON", async ()  => {
    const data = await getData()

    expect(data.length).toBeGreaterThan(0)
  })
 
})
