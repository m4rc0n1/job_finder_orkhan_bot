const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

async function scrapeJobs() {
  //   const pages = [
  //     path.join(__dirname, "test-pages", "jobs-page-1.html"),
  //     path.join(__dirname, "test-pages", "jobs-page-2.html"),
  //     path.join(__dirname, "test-pages", "jobs-page-3.html"),
  //   ];

  const pages = [
    "http://localhost:3001/jobs-page-1.html",
    "http://localhost:3001/jobs-page-2.html",
    "http://localhost:3001/jobs-page-3.html",
  ];

  let allResults = [];

  for (const url of pages) {
    // const html = fs.readFileSync(pagePath, "utf-8");
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
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

      allResults.push({
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
  }

  return allResults;
}

function saveJobs(jobs) {
  const filePath = path.join(__dirname, "../data/jobs.json");
  fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2));
}

function loadSavedJobs() {
  const filePath = path.join(__dirname, "../data/jobs.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function detectNewJobs(scrapedJobs) {
  const savedJobs = loadSavedJobs();
  const savedIds = savedJobs.map((j) => j.id);

  const newJobs = scrapedJobs.filter((job) => !savedIds.includes(job.id));

  const updatedJobs = [...savedJobs, ...newJobs];
  saveJobs(updatedJobs);

  return newJobs;
}

module.exports = { scrapeJobs, detectNewJobs };
