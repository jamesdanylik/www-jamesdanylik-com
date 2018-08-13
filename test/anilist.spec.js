const { getTestData } = require("./browser");

describe("Anilist Source Plugin", () => {
  let title = "";
  let text = "";
  let data = "";

  beforeAll(async () => {
    const testData = await getTestData("anilist");
    const { title: ti, text: te } = testData;
    title = ti;
    text = te;
  });

  test("Site title tag matches expected (test page exists)", async () => {
    expect(title).toBe("gatsby-source-anilist test page");
  });

  test("Inner HTML is parseable JSON", async () => {
    data = JSON.parse(text);

    expect(data.length).toBeGreaterThan(0);
  });
});
