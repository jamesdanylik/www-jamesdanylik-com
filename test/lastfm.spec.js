const { plugins } = require("../gatsby-config.js");
const { getTestData } = require("./browser");

describe("LastFM Source Plugin", () => {
  let title = "";
  let text = "";
  let data = "";

  beforeAll(async () => {
    const testData = await getTestData("lastfm");
    const { title: ti, text: te } = testData;
    title = ti;
    text = te;
  });

  test("Title tag matches expected (test page exists)", async () => {
    expect(title).toBe("gatsby-source-lastfm test page");
  });

  const getPluginOptions = plgs => {
    let d;
    plgs.forEach(plg => {
      if (typeof plg === "object" && plg.resolve === "gatsby-source-lastfm") {
        d = plg.options;
      }
    });
    return d;
  };

  test("Inner HTML is parseable JSON", async () => {
    data = JSON.parse(text);

    expect(data.length).toBeGreaterThan(0);
  });

  test("Number of playbacks matches limit given in plugin options", async () => {
    expect(data.length).toBeGreaterThan(getPluginOptions(plugins).limit - 5);
  });

  test("All playbacks have a track object", async () => {
    data.forEach(playback => {
      expect(typeof playback.node.track).toBe("object");
    });
  });

  test("All tracks have a name", async () => {
    data.forEach(playback => {
      expect(typeof playback.node.track.name).toBe("string");
    });
  });

  test("All tracks have an artist object", async () => {
    data.forEach(playback => {
      expect(typeof playback.node.track.artist).toBe("object");
    });
  });

  test("All tracks have an album object", async () => {
    data.forEach(playback => {
      expect(typeof playback.node.track.album).toBe("object");
    });
  });

  test("All artists have a name", async () => {
    data.forEach(playback => {
      expect(typeof playback.node.track.artist.name).toBe("string");
    });
  });

  test("All albums have a name", async () => {
    data.forEach(playback => {
      expect(typeof playback.node.track.album.name).toBe("string");
    });
  });

  test("All tracks have an image array", async () => {
    data.forEach(playback => {
      expect(typeof playback.node.track.image).toBe("object");
    });
  });

  test("All artists have an image array", async () => {
    data.forEach(playback => {
      expect(typeof playback.node.track.artist.image).toBe("object");
    });
  });
});
