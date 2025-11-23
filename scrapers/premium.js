const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/premium.json");

function loadPremium() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

function savePremium(list) {
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
}

function makePremium(id) {
  const list = loadPremium();
  if (!list.includes(id)) {
    list.push(id);
    savePremium(list);
  }
}

function isPremium(id) {
  return loadPremium().includes(id);
}

module.exports = { loadPremium, savePremium, makePremium, isPremium };
