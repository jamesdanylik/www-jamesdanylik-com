const puppeteer = require("puppeteer")
const { port } = require("../jest-puppeteer.config").server

const siteRoot = `http://localhost:${port}`

describe("Homepage", () => {
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

    await page.goto(siteRoot)
  })

  afterAll(async () => {
    browser.close()
  })

  test("Site title is visible", async () => {
    const t = await page.title()
    expect(t).toBe("james.danylik.com")
  })
})
