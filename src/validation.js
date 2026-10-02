function validateAmount(amount, label = "Amount") {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be greater than 0`);
  }
  return value;
}

function validateId(id) {
  const value = Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("ID must be a positive integer");
  }
  return value;
}

function validateMonth(month) {
  const value = Number(month);
  if (!Number.isInteger(value) || value < 1 || value > 12) {
    throw new Error("Month must be between 1 and 12");
  }
  return value;
}

function validateYear(year) {
  const value = Number(year);
  if (!Number.isInteger(value) || value < 1970 || value > 9999) {
    throw new Error("Year must be a four-digit number between 1970 and 9999");
  }
  return value;
}

function validateDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Date must use YYYY-MM-DD format");
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid date: ${date}`);
  }
  return date;
}

function validateExpense(expense) {
  if (!expense || !Number.isInteger(Number(expense.id)) || Number(expense.id) <= 0) {
    throw new Error("Each expense must have a positive integer id");
  }
  if (typeof expense.description !== "string" || !expense.description.trim()) {
    throw new Error("Each expense must have a description");
  }
  validateAmount(expense.amount);
  if (typeof expense.category !== "string" || !expense.category.trim()) {
    throw new Error("Each expense must have a category");
  }
  validateDate(expense.date);
  return {
    id: Number(expense.id),
    description: expense.description.trim(),
    amount: Number(expense.amount),
    category: expense.category.trim().toLowerCase(),
    date: expense.date,
  };
}

function validateBudget(budget) {
  if (!budget || typeof budget.category !== "string" || !budget.category.trim()) {
    throw new Error("Each budget must have a category");
  }
  validateAmount(budget.amount, "Budget amount");
  if (budget.month !== undefined) validateMonth(budget.month);
  if (budget.year !== undefined) validateYear(budget.year);
  return {
    category: budget.category.trim().toLowerCase(),
    amount: Number(budget.amount),
    month: budget.month === undefined ? undefined : Number(budget.month),
    year: budget.year === undefined ? undefined : Number(budget.year),
  };
}

module.exports = {
  validateAmount,
  validateId,
  validateMonth,
  validateYear,
  validateDate,
  validateExpense,
  validateBudget,
};
