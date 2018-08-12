const puppeteer = require("puppeteer")
const { port } = require("../jest-puppeteer.config").server

const testRoot = `http://localhost:${port}/test/goodreads`

jest.setTimeout(30000)

describe("Goodreads Source Plugin", () => {
  let browser = ""
  let page = ""
  let data = ""
  let t = ""

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
    const rawText = await page.$eval("#test-data", e => e.innerHTML )
    data = JSON.parse(rawText)
    t = await page.title()
  })

  afterAll(async () => {
    browser.close()
  })

  test("Site title tag matches expected (test page exists)", async () => {
    expect(t).toBe("gatsby-source-goodreads test page")
  })

  test("Inner HTML is parseable JSON", async ()  => {
    expect(data.length).toBeGreaterThan(0)
  })

  test("User has at least 3 shelves", async () => {
    expect(data.length).toBeGreaterThan(2)
  })

  test("Each review on a shelf has a book", async () => {
    data.forEach(n => {
      n.node.reviews.forEach(review => {
	expect(typeof review.book).toBe("object")
      })
    })
  })

  test("Each book has a title", async () => {
    data.forEach(n => {
      n.node.reviews.forEach(review => {
	expect(typeof review.book.title).toBe("string")
      })
    })
  })

  test("Each book has an author node", async () => {
    data.forEach(n => {
      n.node.reviews.forEach(review => {
	expect(typeof review.book.authors).toBe("object")
      })
    })
  })

  test("Each author has a name", async () => {
    data.forEach(n => {
      n.node.reviews.forEach(review => {
	review.book.authors.forEach(author => {
	  expect(typeof author.name).toBe("string")
	})
      })
    })
  })  
})
