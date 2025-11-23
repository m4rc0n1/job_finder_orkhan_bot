const cron = require("node-cron");
const { scrapeJobs } = require("../scrapers/allJobs");
const { loadUsers } = require("../scrapers/users");
const { matchJobWithUser } = require("../scrapers/matcher");
const { loadSeenJobs, saveSeenJobs } = require("../scrapers/seenJobs");
const { isPremium } = require("../scrapers/premium");

const { bot } = require("../index");

async function detectNewJobs() {
  const jobs = await scrapeJobs();
  const seen = loadSeenJobs();

  const newOnes = jobs.filter((j) => !seen.includes(j.id));

  if (newOnes.length > 0) {
    const updated = [...seen, ...newOnes.map((j) => j.id)];
    saveSeenJobs(updated);
  }

  return newOnes;
}

async function notifyUsersAboutNewJobs() {
  const newJobs = await detectNewJobs();

  if (newJobs.length === 0) return;
  const users = loadUsers();

  users.forEach((user) => {
    const { id, prefs } = user;

    const matched = newJobs.filter((job) => matchJobWithUser(job, prefs));

    matched.forEach((job) => {
      const premium = isPremium(id);
      const delay = premium ? 0 : 2000;
      setTimeout(() => {
        bot.telegram.sendMessage(
          id,
          `*NEW MATCH FOR YOU!*\n\n` +
            `💼 *${job.title}*\n` +
            `🏢 ${job.company}\n` +
            `📍 ${job.location}\n` +
            `💰 ${job.salary}\n` +
            `📈 ${job.seniority}\n` +
            `🔖 ${job.tags.join(", ")}\n` +
            `📝 ${job.description}\n` +
            `🔗 ${job.link}`,
          { parse_mode: "Markdown" }
        );
      }, delay);
    });
  });
}

cron.schedule("*/1 * * * *", () => {
  console.log("⏱ Running scheduled job scan...");
  notifyUsersAboutNewJobs();
});
