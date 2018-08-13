const puppeteer = require("puppeteer");
const { port } = require("../jest-puppeteer.config").server;

jest.setTimeout(30000);

exports.getTestData = async name => {
  let browser = "";
  let page = "";

  browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  page = await browser.newPage();

  page.emulate({
    viewport: {
      width: 500,
      height: 2400
    },
    userAgent: ""
  });

  await page.goto(`http://localhost:${port}/test/${name}`);

  return {
    text: await page.$eval("#test-data", e => e.innerHTML),
    title: await page.title()
  };
};
