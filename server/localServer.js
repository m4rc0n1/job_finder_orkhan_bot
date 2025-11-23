const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "../scrapers/test-pages")));

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Local job server running at http://localhost:${PORT}`);
});
