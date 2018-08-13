const { getTestData } = require("./browser");

describe("Goodreads Source Plugin", () => {
  let title = "";
  let text = "";

  let data = "";

  beforeAll(async () => {
    const testData = await getTestData("goodreads");
    const { title: ti, text: te } = testData;
    title = ti;
    text = te;
  });

  test("Site title tag matches expected (test page exists)", async () => {
    expect(title).toBe("gatsby-source-goodreads test page");
  });

  test("Inner HTML is parseable JSON", async () => {
    data = JSON.parse(text);
    expect(data.length).toBeGreaterThan(0);
  });

  test("User has at least 3 shelves", async () => {
    expect(data.length).toBeGreaterThan(2);
  });

  test("Each review on a shelf has a book", async () => {
    data.forEach(n => {
      n.node.reviews.forEach(review => {
        expect(typeof review.book).toBe("object");
      });
    });
  });

  test("Each book has a title", async () => {
    data.forEach(n => {
      n.node.reviews.forEach(review => {
        expect(typeof review.book.title).toBe("string");
      });
    });
  });

  test("Each book has an author node", async () => {
    data.forEach(n => {
      n.node.reviews.forEach(review => {
        expect(typeof review.book.authors).toBe("object");
      });
    });
  });

  test("Each author has a name", async () => {
    data.forEach(n => {
      n.node.reviews.forEach(review => {
        review.book.authors.forEach(author => {
          expect(typeof author.name).toBe("string");
        });
      });
    });
  });
});
