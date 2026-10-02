#!/usr/bin/env node

const { Command } = require("commander");

const {
  addExpense,
  listExpenses,
  deleteExpense,
  updateExpense,
  getSummary,
} = require("./expenseManager");

const program = new Command();

program
  .name("expense")
  .description("A simple CLI expense tracker")
  .version("1.0.0");

// ADD
program
  .command("add")
  .description("Add a new expense")
  .requiredOption(
    "--description <description>",
    "Expense description"
  )
  .requiredOption(
    "--amount <amount>",
    "Expense amount"
  )
  .option(
    "--category <category>",
    "Expense category",
    "other"
  )
  .action((options) => {
    try {
      const expense = addExpense(
        options.description,
        options.amount,
        options.category
      );

      console.log(
        `Expense added successfully. ID: ${expense.id}`
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

// LIST
program
  .command("list")
  .description("List all expenses")
  .option(
    "--category <category>",
    "Filter by category"
  )
  .option(
    "--month <month>",
    "Filter by month (1-12)"
  )
  .action((options) => {
    try {
      const expenses = listExpenses({
        category: options.category,
        month: options.month,
      });

      if (expenses.length === 0) {
        console.log("No expenses found.");
        return;
      }

      console.log("\nYour Expenses\n");

      console.table(
        expenses.map((expense) => ({
          ID: expense.id,
          Date: expense.date || "Unknown",
          Description: expense.description,
          Category: expense.category || "other",
          Amount: `₹${expense.amount}`,
        }))
      );

      const total = expenses.reduce(
        (sum, expense) =>
          sum + Number(expense.amount),
        0
      );

      console.log(`Total: ₹${total}\n`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

// UPDATE
program
  .command("update")
  .description("Update an expense")
  .requiredOption(
    "--id <id>",
    "Expense ID"
  )
  .option(
    "--description <description>",
    "New description"
  )
  .option(
    "--amount <amount>",
    "New amount"
  )
  .option(
    "--category <category>",
    "New category"
  )
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

      const expense = updateExpense(
        options.id,
        {
          description: options.description,
          amount: options.amount,
          category: options.category,
        }
      );

      console.log(
        `Expense #${expense.id} updated successfully.`
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

// DELETE
program
  .command("delete")
  .description("Delete an expense")
  .requiredOption(
    "--id <id>",
    "Expense ID"
  )
  .action((options) => {
    try {
      const expense = deleteExpense(options.id);

      console.log(
        `Deleted expense #${expense.id}: ${expense.description}`
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

// SUMMARY
program
  .command("summary")
  .description("Show expense summary")
  .option(
    "--month <month>",
    "Filter by month (1-12)"
  )
  .action((options) => {
    try {
      const summary = getSummary(
        options.month
      );

      console.log("\nExpense Summary\n");

      console.log(
        `Total expenses: ${summary.count}`
      );

      console.log(
        `Total spent:    ₹${summary.total}`
      );

      console.log("\nBy category:");

      const categories = Object.entries(
        summary.byCategory
      );

      if (categories.length === 0) {
        console.log("No expenses found.");
      } else {
        for (const [category, amount] of categories) {
          console.log(
            `${category.padEnd(15)} ₹${amount}`
          );
        }
      }

      console.log();
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

program.parse();