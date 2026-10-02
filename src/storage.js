const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const EXPENSES_FILE = path.join(DATA_DIR, "expenses.json");
const BUDGETS_FILE = path.join(DATA_DIR, "budgets.json");

function ensureFileExists(filePath) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf8");
  }
}

function readJsonFile(filePath) {
  ensureFileExists(filePath);

  const data = fs.readFileSync(filePath, "utf8");

  try {
    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      throw new Error("Data file must contain an array");
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `Invalid JSON data in ${path.basename(filePath)}`
    );
  }
}

function writeJsonFile(filePath, data) {
  ensureFileExists(filePath);

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

// Expenses

function getExpenses() {
  return readJsonFile(EXPENSES_FILE);
}

function saveExpenses(expenses) {
  writeJsonFile(EXPENSES_FILE, expenses);
}

// Budgets

function getBudgets() {
  return readJsonFile(BUDGETS_FILE);
}

function saveBudgets(budgets) {
  writeJsonFile(BUDGETS_FILE, budgets);
}

module.exports = {
  getExpenses,
  saveExpenses,
  getBudgets,
  saveBudgets,
};