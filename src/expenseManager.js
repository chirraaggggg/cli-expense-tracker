const {
  getExpenses,
  saveExpenses,
} = require("./storage");

function validateAmount(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return value;
}

function validateMonth(month) {
  const value = Number(month);

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 12
  ) {
    throw new Error("Month must be between 1 and 12");
  }

  return value;
}

function addExpense(
  description,
  amount,
  category = "other"
) {
  if (!description || !description.trim()) {
    throw new Error("Description is required");
  }

  const validatedAmount = validateAmount(amount);

  if (!category || !category.trim()) {
    category = "other";
  }

  const expenses = getExpenses();

  const nextId =
    expenses.length === 0
      ? 1
      : Math.max(
          ...expenses.map((expense) => Number(expense.id))
        ) + 1;

  const expense = {
    id: nextId,
    description: description.trim(),
    amount: validatedAmount,
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
    const month = validateMonth(filters.month);

    expenses = expenses.filter((expense) => {
      if (!expense.date) {
        return false;
      }

      const expenseMonth = Number(
        expense.date.split("-")[1]
      );

      return expenseMonth === month;
    });
  }

  return expenses;
}

function updateExpense(id, updates) {
  const expenses = getExpenses();

  const expense = expenses.find(
    (item) => item.id === Number(id)
  );

  if (!expense) {
    throw new Error(`Expense with ID ${id} not found`);
  }

  if (updates.description !== undefined) {
    if (!updates.description.trim()) {
      throw new Error("Description cannot be empty");
    }

    expense.description =
      updates.description.trim();
  }

  if (updates.amount !== undefined) {
    expense.amount = validateAmount(
      updates.amount
    );
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

function getSummary(month) {
  let expenses = getExpenses();

  if (month !== undefined) {
    const monthNumber = validateMonth(month);

    expenses = expenses.filter((expense) => {
      if (!expense.date) {
        return false;
      }

      const expenseMonth = Number(
        expense.date.split("-")[1]
      );

      return expenseMonth === monthNumber;
    });
  }

  const total = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  const byCategory = {};

  for (const expense of expenses) {
    const category =
      expense.category || "other";

    if (!byCategory[category]) {
      byCategory[category] = 0;
    }

    byCategory[category] += Number(
      expense.amount
    );
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
  updateExpense,
  deleteExpense,
  getSummary,
};