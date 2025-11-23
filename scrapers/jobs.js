const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const htmlPath = fs.readFileSync(
  path.join(__dirname, "../scrapers/test-pages/jobs.html")
);

async function scrapeJobs() {
  const $ = cheerio.load(htmlPath);
  let results = [];

  $(".job").each((i, el) => {
    const id = $(el).attr("data-id");
    const title = $(el).find(".title").text().trim();
    const company = $(el).find(".company").text().trim();
    const location = $(el).find(".location").text().trim();
    const link = $(el).find(".link").attr("href");
    const salary = $(el).find(".salary").text().trim();
    const seniority = $(el).find(".seniority").text().trim();
    const description = $(el).find(".description").text().trim();
    const tags = $(el)
      .find(".tags")
      .text()
      .split(",")
      .map((t) => t.trim());

    results.push({
      id,
      title,
      company,
      location,
      link,
      salary,
      seniority,
      description,
      tags,
    });
  });

  return results;
}

module.exports = { scrapeJobs };
