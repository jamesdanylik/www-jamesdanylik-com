const { getTestData } = require("./browser");

describe("Steam Source Plugin", () => {
  let title = "";
  let text = "";

  beforeAll(async () => {
    const testData = await getTestData("steam");
    const { title: ti, text: te } = testData;
    title = ti;
    text = te;
  });

  test("Site title tag matches expected (test page exists)", async () => {
    expect(title).toBe("gatsby-source-steam test page");
  });

  test("Inner HTML is parseable JSON", async () => {
    const data = JSON.parse(text);

    expect(data.length).toBeGreaterThan(0);
  });
});
