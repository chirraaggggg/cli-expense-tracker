const chalk = require("chalk");
const Table = require("cli-table3");

// ─────────────────────────────────────────────
// EXPENSE TABLE
// ─────────────────────────────────────────────

function printExpenses(expenses) {
  if (expenses.length === 0) {
    console.log(chalk.yellow("No expenses found."));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan("ID"),
      chalk.cyan("DATE"),
      chalk.cyan("DESCRIPTION"),
      chalk.cyan("CATEGORY"),
      chalk.cyan("AMOUNT"),
    ],
    colWidths: [6, 14, 25, 16, 14],
    wordWrap: true,
  });

  expenses.forEach((expense) => {
    table.push([
      expense.id,
      expense.date,
      expense.description,
      expense.category,
      chalk.green(`₹${expense.amount}`),
    ]);
  });

  console.log();
  console.log(table.toString());
  console.log();
}

// ─────────────────────────────────────────────
// SUCCESS MESSAGE
// ─────────────────────────────────────────────

function success(message) {
  console.log(chalk.green(`✓ ${message}`));
}

// ─────────────────────────────────────────────
// ERROR MESSAGE
// ─────────────────────────────────────────────

function error(message) {
  console.error(chalk.red(`✗ ${message}`));
}

// ─────────────────────────────────────────────
// INFO MESSAGE
// ─────────────────────────────────────────────

function info(message) {
  console.log(chalk.blue(`ℹ ${message}`));
}

// ─────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────

function summary({ count, total }) {
  console.log();
  console.log(chalk.bold("Expense Summary"));
  console.log(chalk.gray("────────────────────"));

  console.log(
    `Expenses: ${chalk.cyan(count)}`
  );

  console.log(
    `Total:    ${chalk.green(`₹${total}`)}`
  );

  console.log();
}

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  printExpenses,
  success,
  error,
  info,
  summary,
};