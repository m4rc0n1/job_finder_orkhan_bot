/*
axios -=> downloading HTML pages
cheerio -> parse HTML and extract data
node-cron -> run scheduled background scanning
telegraf -> Telegram bot core
*/
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "../scrapers/test-pages")));

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Local job server running at http://localhost:${PORT}`);
});

const { Telegraf } = require("telegraf");
const { scrapeJobs, detectNewJobs } = require("./scrapers/allJobs");
const bot = new Telegraf(process.env.BOT_TOKEN);
const REDSYS_TEST_TOKEN = process.env.REDSYS_TEST_TOKEN;
const { saveUserPreferences, getUser } = require("./scrapers/users");
const { matchJobWithUser } = require("./scrapers/matcher");
const { makePremium, isPremium } = require("./scrapers/premium");

bot.start((ctx) => ctx.reply("Welcome to Job Finder Bot"));

bot.command("latestjobs", async (ctx) => {
  const jobs = await scrapeJobs();
  const newJobs = detectNewJobs(jobs);

  if (newJobs.length === 0) {
    return ctx.reply("No new jobs found today.");
  }

  newJobs.forEach((job) => {
    ctx.reply(
      `*NEW JOB ALERT!*\n\n
      💼 ${job.title}\n
       🏢 ${job.company}\n
       📍${job.location}\n
       💰 ${job.salary}\n
       📈 ${job.seniority}\n
       🔖 ${job.tags.join(", ")}\n
       📝 ${job.description}\n
       🔗${job.link}`,
      { parse_mode: "Markdown" }
    );
  });
});

bot.command("upgrade", (ctx) => {
  ctx.replyWithInvoice({
    provider_token: REDSYS_TEST_TOKEN,
    title: "Premium Upgrade",
    description:
      "Unlock instant alert, premium job pages and priority scanning",
    currency: "USD",
    prices: [{ label: "Premium Access", amount: 100 }], //0.01 cents
    payload: "premium-upgrade",
  });
});

bot.command("mysubscription", (ctx) => {
  const user = getUser(ctx.from.id);

  if (!user) return ctx.reply(" You are not subscribed.");
  const p = user.prefs;

  ctx.reply(
    `
    📝 Your subscription\n\n
    👤 Status: ${isPremium(ctx.from.id) ? "Premium user" : "Free user"}\n
    🔍 Keyword: ${p.keyword}\n
    📍 Location: ${p.location}\n
    💰 Salary: ${p.minSalary}\n
    📈 Seniority: ${p.seniority}\n
    🔖 Tags: ${p.tags.join(", ")}`,
    { parse_mode: "Markdown" }
  );
});

bot.on("pre_checkout_query", (ctx) => {
  ctx.answerPreCheckoutQuery(true);
});

bot.on("successful_payment", (ctx) => {
  const userId = ctx.from.id;

  makePremium(userId);

  ctx.reply(
    "🎉 Payment Successful! *You now have full access to Premium features*.\n Enjoy instant alerts, more job pages and priority matching",
    { parse_mode: "Markdown" }
  );
});

/*
User types /subscribe
Bot asks for a keyword
Bot asks for location
Bot asks for min salary
Bot asks for seniority
Bot asks for tags
Bot saves settings
*/

let userSteps = {};

bot.command("subscribe", (ctx) => {
  const id = ctx.from.id;

  userSteps[id] = { step: 1, prefs: {} };
  ctx.reply(
    "🔍 Enter a *keyword* to search for jobs (example: React, Node, QA):",
    {
      parse_mode: "Markdown",
    }
  );
});

bot.command("matchjobs", async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user) {
    return ctx.reply(
      "❗You don't have any subscription yet. Use /subscribe first."
    );
  }

  const prefs = user.prefs;
  const jobs = await scrapeJobs();
  const matched = jobs.filter((job) => matchJobWithUser(job, prefs));

  if (matched.length === 0) {
    return ctx.reply("😔 No jobs match your preferences right now.");
  }

  matched.forEach((job) => {
    ctx.reply(
      `*MATCHED JOB!*\n\n
        💼 *${job.title}*\n
        🏢 ${job.company}\n
        📍 ${job.location}\n
        💰 ${job.salary}\n
        📈 ${job.seniority}\n
        🔖 Tags: ${job.tags.join(", ")}\n
        📝 ${job.description}\n
        🔗 ${job.link}`,
      { parse_mode: "Markdown" }
    );
  });
});

bot.on("text", (ctx) => {
  const id = ctx.from.id;

  if (!userSteps[id]) return;
  const user = userSteps[id];

  //   STEP 1 - keyword
  if (user.step === 1) {
    user.prefs.keyword = ctx.message.text;
    user.step = 2;
    return ctx.reply("📍 Enter location (or type *any*):", {
      parse_mode: "Markdown",
    });
  }

  //   STEP 2 - location
  if (user.step === 2) {
    user.prefs.location = ctx.message.text;
    user.step = 3;
    return ctx.reply("💰 Minimum salary? (example: 2000");
  }

  //   STEP 3 - Salary

  if (user.step === 3) {
    user.prefs.minSalary = ctx.message.text;
    user.step = 4;
    return ctx.reply("📈 Seniority? (Junior / Mid-level / Senior");
  }

  //   Step 4 - Seniority
  if (user.step === 4) {
    user.prefs.seniority = ctx.message.text;
    user.step = 5;
    return ctx.reply("🔖 Tags? (comma seperated, example: react,node,aws)");
  }

  //   Step 5 - Tags
  if (user.step === 5) {
    user.prefs.tags = ctx.message.text.split(",").map((t) => t.trim());
    saveUserPreferences(id, user.prefs);

    delete userSteps[id];

    return ctx.reply(
      "✅ *Subscription complete!*\n You will now receive job matches.\n\n Use /latestjobs to check manually",
      { parse_mode: "Markdown" }
    );
  }
});

if (process.env.NODE_ENV === "production") {
  bot.launch({
    webhook: {
      domain: process.env.WEBHOOK_URL,
      port: process.env.PORT || 3000,
    },
  });
  console.log("BOT RUNNING in WEBHOOK mode");
} else {
  bot.launch();
  console.log("Bot running in POLLING mode");
}

module.exports.bot = bot;
require("./cron/scheduler");
