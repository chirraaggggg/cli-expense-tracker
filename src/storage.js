const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/expenses.json");

function getExpenses() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }

  const data = fs.readFileSync(DATA_FILE, "utf8");

  try {
    return JSON.parse(data);
  } catch {
    throw new Error("expenses.json contains invalid JSON");
  }
}

function saveExpenses(expenses) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(expenses, null, 2),
    "utf8"
  );
}

module.exports = {
  getExpenses,
  saveExpenses,
};