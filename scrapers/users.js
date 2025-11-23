const fs = require("fs");
const path = require("path");

function loadUsers() {
  const filePath = path.join(__dirname, "../data/users.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveUsers(users) {
  const filePath = path.join(__dirname, "../data/users.json");
  if (!fs.existsSync(filePath)) return [];
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

function getUser(userId) {
  const users = loadUsers();
  return users.find((u) => u.id === userId);
}

function saveUserPreferences(userId, prefs) {
  const users = loadUsers();
  const existing = users.find((u) => u.id === userId);

  if (existing) {
    existing.prefs = prefs;
  } else {
    users.push({ id: userId, prefs });
  }

  saveUsers(users);
}

module.exports = {
  loadUsers,
  saveUsers,
  getUser,
  saveUserPreferences,
};
