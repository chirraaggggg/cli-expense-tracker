const {
  getBudgets,
  saveBudgets,
  getExpenses,
} = require("./storage");

function validateAmount(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      "Budget amount must be greater than 0"
    );
  }

  return value;
}

function setBudget(category, amount) {
  if (!category || !category.trim()) {
    throw new Error("Category is required");
  }

  const normalizedCategory =
    category.trim().toLowerCase();

  const validatedAmount =
    validateAmount(amount);

  const budgets = getBudgets();

  const existingBudget = budgets.find(
    (budget) =>
      budget.category === normalizedCategory
  );

  if (existingBudget) {
    existingBudget.amount =
      validatedAmount;
  } else {
    budgets.push({
      category: normalizedCategory,
      amount: validatedAmount,
    });
  }

  saveBudgets(budgets);

  return {
    category: normalizedCategory,
    amount: validatedAmount,
  };
}

function listBudgets() {
  return getBudgets();
}

function deleteBudget(category) {
  if (!category || !category.trim()) {
    throw new Error("Category is required");
  }

  const normalizedCategory =
    category.trim().toLowerCase();

  const budgets = getBudgets();

  const index = budgets.findIndex(
    (budget) =>
      budget.category === normalizedCategory
  );

  if (index === -1) {
    throw new Error(
      `No budget found for category "${normalizedCategory}"`
    );
  }

  const deleted = budgets.splice(index, 1)[0];

  saveBudgets(budgets);

  return deleted;
}

function getBudgetStatus() {
  const budgets = getBudgets();
  const expenses = getExpenses();

  const spendingByCategory = {};

  for (const expense of expenses) {
    const category =
      expense.category || "other";

    if (!spendingByCategory[category]) {
      spendingByCategory[category] = 0;
    }

    spendingByCategory[category] += Number(
      expense.amount
    );
  }

  return budgets.map((budget) => {
    const spent =
      spendingByCategory[budget.category] || 0;

    const remaining =
      Number(budget.amount) - spent;

    return {
      category: budget.category,
      budget: Number(budget.amount),
      spent,
      remaining,
      exceeded: remaining < 0,
    };
  });
}

module.exports = {
  setBudget,
  listBudgets,
  deleteBudget,
  getBudgetStatus,
};