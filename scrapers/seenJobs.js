const fs = require("fs");
const path = require("path");

function loadSeenJobs() {
  const filePath = path.join(__dirname, "../data/seen-jobs.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveSeenJobs(jobs) {
  const filePath = path.join(__dirname, "../data/seen-jobs.json");
  fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2));
}

module.exports = { loadSeenJobs, saveSeenJobs };
