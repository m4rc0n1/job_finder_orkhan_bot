❌ 1. Websites with anti-scraping protection

(Cloudflare, bot detection, JS rendering)

❌ 2. Websites whose robots.txt forbids it

(e.g. LinkedIn, Indeed)

❌ 3. Commercial job boards

(Often forbidden: Indeed, Glassdoor, Workable, Pracuj.pl, NoFluffJobs)

❌ 4. Websites requiring login (illegal & unsafe)
❌ 5. Websites without written permission

If Terms of Service say scraping is not allowed → DO NOT use them.

              ┌──────────────────┐
              │  Render (FREE)   │
              │  Bot + Webhook   │
              └───────▲──────────┘
                      │
                      │ bot.telegram.sendMessage()
                      │
              ┌───────┴──────────┐
              │ Railway (FREE)    │
              │ Cron Scheduler    │
              └───────────────────┘
