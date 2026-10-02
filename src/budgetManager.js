const { getBudgets, saveBudgets, getExpenses } = require("./storage");
const { filterExpenses } = require("./filters");
const { validateAmount, validateMonth, validateYear, validateBudget } = require("./validation");

function period(month, year) {
  return {
    month: month === undefined ? new Date().getMonth() + 1 : validateMonth(month),
    year: year === undefined ? new Date().getFullYear() : validateYear(year),
  };
}

function normalizedBudgets() {
  return getBudgets().map((budget) => ({
    category: budget.category,
    amount: Number(budget.amount),
    month: budget.month === undefined ? undefined : Number(budget.month),
    year: budget.year === undefined ? undefined : Number(budget.year),
  }));
}

function setBudget(category, amount, month, year) {
  if (typeof category !== "string" || !category.trim()) throw new Error("Category is required");
  const { month: targetMonth, year: targetYear } = period(month, year);
  const normalizedCategory = category.trim().toLowerCase();
  const budgets = normalizedBudgets();
  const index = budgets.findIndex((item) =>
    item.category === normalizedCategory && item.month === targetMonth && item.year === targetYear
  );
  const budget = { category: normalizedCategory, amount: validateAmount(amount, "Budget amount"), month: targetMonth, year: targetYear };
  if (index === -1) budgets.push(budget); else budgets[index] = budget;
  saveBudgets(budgets);
  return budget;
}

function listBudgets(month, year) {
  const target = period(month, year);
  return normalizedBudgets().filter((budget) =>
    budget.month === undefined || (budget.month === target.month && budget.year === target.year)
  );
}

function deleteBudget(category, month, year) {
  if (typeof category !== "string" || !category.trim()) throw new Error("Category is required");
  const target = period(month, year);
  const normalizedCategory = category.trim().toLowerCase();
  const budgets = normalizedBudgets();
  const index = budgets.findIndex((item) =>
    item.category === normalizedCategory && (item.month === undefined || (item.month === target.month && item.year === target.year))
  );
  if (index === -1) throw new Error(`No budget found for category "${normalizedCategory}"`);
  const [deleted] = budgets.splice(index, 1);
  saveBudgets(budgets);
  return deleted;
}

function getBudgetStatus(month, year) {
  const target = period(month, year);
  const expenses = filterExpenses(getExpenses(), { month: target.month, year: target.year });
  const budgets = listBudgets(target.month, target.year);
  return budgets.map((budget) => {
    const spent = expenses
      .filter((item) => (item.category || "other") === budget.category)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const remaining = Number(budget.amount) - spent;
    return { ...budget, budget: Number(budget.amount), spent, remaining, exceeded: remaining < 0, percentage: budget.amount ? (spent / budget.amount) * 100 : 0 };
  });
}

module.exports = { setBudget, listBudgets, deleteBudget, getBudgetStatus, period };
