const puppeteer = require("puppeteer")
const { port } = require("../jest-puppeteer.config").server

const testRoot = `http://localhost:${port}/testGoodreads`

jest.setTimeout(30000)

describe("Goodreads Source Plugin", () => {
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
    const rawText = await page.$eval("#test-data", e => { return e.innerHTML })
    return JSON.parse(rawText)
  }

  test("Site title tag matches expected (test page exists)", async () => {
    const t = await page.title()
    expect(t).toBe("gatsby-source-goodreads test page")
  })

  test("Inner HTML is parseable JSON", async ()  => {
    const data = await getData()

    expect(data.length).toBeGreaterThan(0)
  })

  test("User has at least 3 shelves", async () => {
    const data = await getData()

    expect(data.length).toBeGreaterThan(2)
  })

  test("Each review on a shelf has a book", async () => {
    const data = await getData()

    data.forEach(n => {
      n.node.reviews.forEach(review => {
	expect(typeof review.book).toBe("object")
      })
    })
  })

  test("Each book has a title", async () => {
    const data = await getData()

    data.forEach(n => {
      n.node.reviews.forEach(review => {
	expect(typeof review.book.title).toBe("string")
      })
    })
  })

  test("Each book has an author node", async () => {
    const data = await getData()

    data.forEach(n => {
      n.node.reviews.forEach(review => {
	expect(typeof review.book.authors).toBe("object")
      })
    })
  })

  test("Each author has a name", async () => {
    const data = await getData()

    data.forEach(n => {
      n.node.reviews.forEach(review => {
	review.book.authors.forEach(author => {
	  expect(typeof author.name).toBe("string")
	})
      })
    })
  })  
})
