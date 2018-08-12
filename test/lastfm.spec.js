const puppeteer = require("puppeteer")
const { port } = require("../jest-puppeteer.config").server
const { plugins } = require("../gatsby-config.js")


const testUrl = `http://localhost:${port}/test/lastfm`

jest.setTimeout(30000)

describe("LastFM Source Plugin", () => {
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

    await page.goto(testUrl)
  })

  afterAll(async () => {
    browser.close()
  })

  test("Title tag matches expected (test page exists)", async () => {
    const t = await page.title()
    expect(t).toBe("gatsby-source-lastfm test page")
  })

  const getData = async () => {
    const rawText = await page.$eval("#test-data", e => e.innerHTML)
    return JSON.parse(rawText)
  }

  const getPluginOptions = (plgs) => {
    let d
    plgs.forEach(plg => {
      if( (typeof(plg) === "object") && (plg.resolve === "gatsby-source-lastfm")) {
	d = plg.options
      }
    })
    return d
  }

  test("Inner HTML is parseable JSON", async () => {
    const data = await getData()

    expect(data.length).toBeGreaterThan(0)
  })

  test("Number of playbacks matches limit given in plugin options", async () => {
    const data = await getData()

    expect(data.length).toBeGreaterThan(getPluginOptions(plugins).limit-5)
  })

  test("All playbacks have a track object", async () => {
    const data = await getData()

    data.forEach(playback => {
      expect(typeof playback.node.track).toBe("object")
    })
  })

  test("All tracks have a name", async () => {
    const data = await getData()

    data.forEach(playback => {
      expect(typeof playback.node.track.name).toBe("string")
    })
  })

  test("All tracks have an artist object", async () => {
    const data = await getData()

    data.forEach(playback => {
      expect(typeof playback.node.track.artist).toBe("object")
    })
  })

  test("All tracks have an album object", async () => {
    const data = await getData()

    data.forEach(playback => {
      expect(typeof playback.node.track.album).toBe("object")
    })
  })

  test("All artists have a name", async () => {
    const data = await getData()

    data.forEach(playback => {
      expect(typeof playback.node.track.artist.name).toBe("string")
    })
  })

  test("All albums have a name", async () => {
    const data = await getData()

    data.forEach(playback => {
      expect(typeof playback.node.track.album.name).toBe("string")
    })
  })

  test("All tracks have an image array", async () => {
    const data = await getData()

    data.forEach(playback => {
      expect(typeof playback.node.track.image).toBe("object")
    })
  })

  test("All artists have an image array", async () => {
    const data = await getData()

    data.forEach(playback => {
      expect(typeof playback.node.track.artist.image).toBe("object")
    })
  })
})
