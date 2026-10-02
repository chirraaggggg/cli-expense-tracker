const { getExpenses, saveExpenses } = require("./storage");

function addExpense(description, amount, category = "other") {
  if (!description || !description.trim()) {
    throw new Error("Description is required");
  }

  amount = Number(amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const expenses = getExpenses();

  const nextId =
    expenses.length === 0
      ? 1
      : Math.max(...expenses.map((expense) => expense.id)) + 1;

  const expense = {
    id: nextId,
    description: description.trim(),
    amount,
    category: category.trim().toLowerCase(),
    date: new Date().toISOString().split("T")[0],
  };

  expenses.push(expense);
  saveExpenses(expenses);

  return expense;
}

function listExpenses(filters = {}) {
  let expenses = getExpenses();

  if (filters.category) {
    expenses = expenses.filter(
      (expense) =>
        expense.category &&
        expense.category.toLowerCase() ===
          filters.category.toLowerCase()
    );
  }

  if (filters.month !== undefined) {
    const month = Number(filters.month);

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      throw new Error("Month must be between 1 and 12");
    }

    expenses = expenses.filter((expense) => {
      if (!expense.date) return false;

      const expenseMonth = Number(
        expense.date.split("-")[1]
      );

      return expenseMonth === month;
    });
  }

  return expenses;
}

function deleteExpense(id) {
  const expenses = getExpenses();

  const index = expenses.findIndex(
    (expense) => expense.id === Number(id)
  );

  if (index === -1) {
    throw new Error(`Expense with ID ${id} not found`);
  }

  const deleted = expenses.splice(index, 1)[0];

  saveExpenses(expenses);

  return deleted;
}

function updateExpense(id, updates) {
  const expenses = getExpenses();

  const expense = expenses.find(
    (expense) => expense.id === Number(id)
  );

  if (!expense) {
    throw new Error(`Expense with ID ${id} not found`);
  }

  if (updates.description !== undefined) {
    if (!updates.description.trim()) {
      throw new Error("Description cannot be empty");
    }

    expense.description = updates.description.trim();
  }

  if (updates.amount !== undefined) {
    const amount = Number(updates.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    expense.amount = amount;
  }

  if (updates.category !== undefined) {
    if (!updates.category.trim()) {
      throw new Error("Category cannot be empty");
    }

    expense.category =
      updates.category.trim().toLowerCase();
  }

  saveExpenses(expenses);

  return expense;
}

function getSummary(month) {
  let expenses = getExpenses();

  if (month !== undefined) {
    const monthNumber = Number(month);

    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      throw new Error("Month must be between 1 and 12");
    }

    expenses = expenses.filter((expense) => {
      if (!expense.date) return false;

      const expenseMonth = Number(
        expense.date.split("-")[1]
      );

      return expenseMonth === monthNumber;
    });
  }

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const byCategory = {};

  for (const expense of expenses) {
    const category = expense.category || "other";

    if (!byCategory[category]) {
      byCategory[category] = 0;
    }

    byCategory[category] += Number(expense.amount);
  }

  return {
    count: expenses.length,
    total,
    byCategory,
  };
}

module.exports = {
  addExpense,
  listExpenses,
  deleteExpense,
  updateExpense,
  getSummary,
};