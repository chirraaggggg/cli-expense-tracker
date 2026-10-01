#!/usr/bin/env node

const { Command } = require("commander");

const {
  addExpense,
  listExpenses,
  deleteExpense,
  updateExpense,
  getSummary,
} = require("./expenseManager");

const {
  printExpenses,
  success,
  error,
  summary,
} = require("./ui");

const program = new Command();

program
  .name("expense")
  .description("A simple CLI expense tracker")
  .version("1.0.0");

// ─────────────────────────────────────────────
// ADD
// ─────────────────────────────────────────────

program
  .command("add")
  .description("Add a new expense")
  .requiredOption("--description <description>", "Expense description")
  .requiredOption("--amount <amount>", "Expense amount")
  .option("--category <category>", "Expense category", "other")
  .action((options) => {
    try {
      const expense = addExpense(
        options.description,
        options.amount,
        options.category
      );

      success(`Expense added successfully. ID: ${expense.id}`);
    } catch (err) {
      error(err.message);
      process.exitCode = 1;
    }
  });

// ─────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────

program
  .command("list")
  .description("List expenses")
  .option("--category <category>", "Filter by category")
  .option("--month <month>", "Filter by month (1-12)")
  .action((options) => {
    try {
      const expenses = listExpenses({
        category: options.category,
        month: options.month,
      });

      printExpenses(expenses);
    } catch (err) {
      error(err.message);
      process.exitCode = 1;
    }
  });

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

program
  .command("delete")
  .description("Delete an expense")
  .requiredOption("--id <id>", "Expense ID")
  .action((options) => {
    try {
      const expense = deleteExpense(options.id);

      success(
        `Deleted expense #${expense.id}: ${expense.description}`
      );
    } catch (err) {
      error(err.message);
      process.exitCode = 1;
    }
  });

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

program
  .command("update")
  .description("Update an expense")
  .requiredOption("--id <id>", "Expense ID")
  .option("--description <description>", "New description")
  .option("--amount <amount>", "New amount")
  .option("--category <category>", "New category")
  .action((options) => {
    try {
      if (
        options.description === undefined &&
        options.amount === undefined &&
        options.category === undefined
      ) {
        throw new Error(
          "Provide at least one field to update"
        );
      }

      const expense = updateExpense(options.id, {
        description: options.description,
        amount: options.amount,
        category: options.category,
      });

      success(`Expense #${expense.id} updated successfully.`);
    } catch (err) {
      error(err.message);
      process.exitCode = 1;
    }
  });

// ─────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────

program
  .command("summary")
  .description("Show expense summary")
  .option("--month <month>", "Filter by month (1-12)")
  .action((options) => {
    try {
      const result = getSummary(options.month);

      summary(result);
    } catch (err) {
      error(err.message);
      process.exitCode = 1;
    }
  });

// ─────────────────────────────────────────────
// RUN CLI
// ─────────────────────────────────────────────

program.parse();