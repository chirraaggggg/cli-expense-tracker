const { getExpenses, saveExpenses } = require("./storage");
const { filterExpenses, sortExpenses } = require("./filters");
const { validateAmount, validateId, validateDate, validateExpense } = require("./validation");

function addExpense(description, amount, category = "other", date = new Date().toISOString().slice(0, 10)) {
  if (typeof description !== "string" || !description.trim()) throw new Error("Description is required");
  if (typeof category !== "string" || !category.trim()) throw new Error("Category is required");
  validateDate(date);
  const expenses = getExpenses();
  const nextId = expenses.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  const expense = validateExpense({ id: nextId, description, amount: validateAmount(amount), category, date });
  saveExpenses([...expenses, expense]);
  return expense;
}

function listExpenses(filters = {}) {
  return sortExpenses(filterExpenses(getExpenses(), filters), filters.sort);
}

function updateExpense(id, updates) {
  const numericId = validateId(id);
  const expenses = getExpenses();
  const index = expenses.findIndex((item) => Number(item.id) === numericId);
  if (index === -1) throw new Error(`Expense with ID ${id} not found`);
  const current = expenses[index];
  const next = {
    ...current,
    ...(updates.description !== undefined ? { description: updates.description } : {}),
    ...(updates.amount !== undefined ? { amount: validateAmount(updates.amount) } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
  };
  if (typeof next.description !== "string" || !next.description.trim()) throw new Error("Description cannot be empty");
  if (typeof next.category !== "string" || !next.category.trim()) throw new Error("Category cannot be empty");
  expenses[index] = validateExpense(next);
  saveExpenses(expenses);
  return expenses[index];
}

function deleteExpense(id) {
  const numericId = validateId(id);
  const expenses = getExpenses();
  const index = expenses.findIndex((item) => Number(item.id) === numericId);
  if (index === -1) throw new Error(`Expense with ID ${id} not found`);
  const [deleted] = expenses.splice(index, 1);
  saveExpenses(expenses);
  return deleted;
}

function deleteExpenses(filters) {
  const expenses = getExpenses();
  const matches = filterExpenses(expenses, filters);
  if (!matches.length) throw new Error("No expenses found for the supplied filters");
  const ids = new Set(matches.map((item) => Number(item.id)));
  saveExpenses(expenses.filter((item) => !ids.has(Number(item.id))));
  return matches;
}

function clearExpenses() {
  const expenses = getExpenses();
  saveExpenses([]);
  return expenses.length;
}

function summarize(expenses) {
  const amounts = expenses.map((item) => Number(item.amount));
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  const byCategory = {};
  for (const expense of expenses) {
    const category = expense.category || "other";
    byCategory[category] = (byCategory[category] || 0) + Number(expense.amount);
  }
  return {
    count: expenses.length,
    total,
    average: expenses.length ? total / expenses.length : 0,
    largest: expenses.length ? Math.max(...amounts) : 0,
    smallest: expenses.length ? Math.min(...amounts) : 0,
    byCategory,
  };
}

function getSummary(filters = {}) {
  return summarize(filterExpenses(getExpenses(), typeof filters === "object" ? filters : { month: filters }));
}

function getStats(filters = {}) {
  return getSummary(filters);
}

module.exports = { addExpense, listExpenses, updateExpense, deleteExpense, deleteExpenses, clearExpenses, getSummary, getStats, summarize };
