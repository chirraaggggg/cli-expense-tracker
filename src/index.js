#!/usr/bin/env node
const { Command } = require("commander");
const readline = require("readline");
const { addExpense, listExpenses, updateExpense, deleteExpense, deleteExpenses, clearExpenses, getSummary, getStats } = require("./expenseManager");
const { setBudget, listBudgets, deleteBudget, getBudgetStatus } = require("./budgetManager");
const { monthlyReport, periodReport } = require("./reportManager");
const { exportExpenses, importExpenses } = require("./importExport");

const money = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const heading = (text) => console.log(`\n\x1b[1m${text}\x1b[0m`);
const fail = (error) => { console.error(`\x1b[31m✗ ${error.message}\x1b[0m`); process.exitCode = 1; };
const success = (text) => console.log(`\x1b[32m✓ ${text}\x1b[0m`);

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

async function confirm(question, yes) {
  return yes || (await ask(`${question} (y/N) `)).toLowerCase() === "y";
}

function printBreakdown(values) {
  for (const [category, amount] of Object.entries(values).sort((a, b) => b[1] - a[1])) console.log(`${category.padEnd(18)} ${money(amount)}`);
}

const program = new Command();
program.name("expense").description("A production-ready CLI expense tracker").version("2.0.0");

program.command("add").description("Add an expense").option("--description <description>", "Expense description").option("--amount <amount>", "Expense amount").option("--category <category>", "Expense category").action(async (options) => {
  try {
    const description = options.description || await ask("Description: ");
    const amount = options.amount || await ask("Amount: ");
    const category = options.category || await ask("Category: ");
    const expense = addExpense(description, amount, category);
    success(`Expense added successfully. ID: ${expense.id}`);
  } catch (error) { fail(error); }
});

program.command("list").description("List expenses").option("--category <category>", "Filter by category").option("--month <month>", "Filter by month (1-12)").option("--year <year>", "Filter by year").option("--from <date>", "Start date (YYYY-MM-DD)").option("--to <date>", "End date (YYYY-MM-DD)").option("--search <text>", "Search description or category").option("--sort <sort>", "amount, amount-desc, date, date-desc, description").action((options) => {
  try {
    const expenses = listExpenses(options);
    if (!expenses.length) return console.log("No expenses found.");
    heading("Expenses");
    console.table(expenses.map((item) => ({ ID: item.id, Date: item.date, Description: item.description, Category: item.category, Amount: money(item.amount) })));
    console.log(`Total: ${money(expenses.reduce((sum, item) => sum + Number(item.amount), 0))}`);
  } catch (error) { fail(error); }
});

program.command("update").description("Update an expense").requiredOption("--id <id>", "Expense ID").option("--description <description>", "New description").option("--amount <amount>", "New amount").option("--category <category>", "New category").action((options) => {
  try {
    if ([options.description, options.amount, options.category].every((value) => value === undefined)) throw new Error("Provide at least one field to update");
    updateExpense(options.id, options); success(`Expense #${options.id} updated successfully.`);
  } catch (error) { fail(error); }
});

program.command("delete").description("Delete expenses safely").option("--id <id>", "Expense ID").option("--category <category>", "Delete a category").option("--month <month>", "Delete a month").option("--yes", "Skip confirmation").action(async (options) => {
  try {
    if (!options.id && !options.category && !options.month) throw new Error("Provide --id, --category, or --month");
    if (options.id) {
      const item = listExpenses().find((expense) => Number(expense.id) === Number(options.id));
      if (!item) throw new Error(`Expense with ID ${options.id} not found`);
      if (!await confirm(`Delete expense #${item.id} "${item.description}" for ${money(item.amount)}?`, options.yes)) return console.log("Deletion cancelled.");
      deleteExpense(options.id); return success(`Deleted expense #${item.id}.`);
    }
    const matches = listExpenses(options);
    if (!await confirm(`Delete ${matches.length} expense(s)?`, options.yes)) return console.log("Deletion cancelled.");
    deleteExpenses(options); success(`Deleted ${matches.length} expense(s).`);
  } catch (error) { fail(error); }
});

function printSummary(summary, title = "Expense Summary") {
  heading(title); console.log(`Total expenses: ${summary.count}`); console.log(`Total spent:    ${money(summary.total)}`); console.log(`Average:        ${money(summary.average)}`);
  if (summary.count) { console.log(`Largest:        ${money(summary.largest)}`); console.log(`Smallest:       ${money(summary.smallest)}`); }
  console.log("\nBy category:"); if (summary.count) printBreakdown(summary.byCategory); else console.log("No expenses found.");
}

function printWarnings(statuses) {
  for (const status of statuses) {
    if (status.percentage >= 100) console.log(`\x1b[33m⚠ ${status.category} budget exceeded by ${money(Math.abs(status.remaining))}\x1b[0m`);
    else if (status.percentage >= 80) console.log(`\x1b[33m⚠ ${status.category} budget is ${Math.round(status.percentage)}% used\x1b[0m`);
  }
}

program.command("summary").description("Show expense summary").option("--month <month>").option("--year <year>").option("--from <date>").option("--to <date>").action((options) => {
  try { printSummary(getSummary(options)); printWarnings(getBudgetStatus(options.month, options.year)); } catch (error) { fail(error); }
});
program.command("stats").description("Show expense statistics").option("--month <month>").option("--year <year>").option("--category <category>").option("--from <date>").option("--to <date>").action((options) => {
  try { const stats = getStats(options); printSummary(stats, "Expense Statistics"); } catch (error) { fail(error); }
});
program.command("categories").description("Show categories and spending").action(() => {
  try { const stats = getSummary(); heading("Categories"); if (!Object.keys(stats.byCategory).length) console.log("No categories found."); else printBreakdown(stats.byCategory); } catch (error) { fail(error); }
});
program.command("report").description("Show a monthly or yearly report").option("--month <month>").option("--year <year>").action((options) => {
  try {
    if (options.year !== undefined && options.month === undefined) {
      const report = monthlyReport(options.year); heading(`${report.year} Expense Report`);
      report.months.forEach((amount, index) => console.log(`${new Date(2000, index).toLocaleString("en", { month: "long" }).padEnd(12)} ${money(amount)}`));
      console.log(`\nTotal: ${money(report.total)}\nAverage monthly spending: ${money(report.average)}`);
      if (report.total) console.log(`Highest spending month: ${report.highestMonth}\nLowest spending month: ${report.lowestMonth}`);
    } else {
      const report = periodReport(options.month, options.year); printSummary(report.summary, `${new Date(report.year, report.month - 1).toLocaleString("en", { month: "long" })} ${report.year} Report`);
      heading("Budget Status"); if (!report.budgets.length) console.log("No budgets found."); else report.budgets.forEach((item) => console.log(`${item.category.padEnd(18)} ${money(item.spent)} / ${money(item.budget)}`));
      printWarnings(report.budgets);
    }
  } catch (error) { fail(error); }
});

const budget = program.command("budget").description("Manage monthly category budgets");
budget.command("set").description("Set a budget").requiredOption("--category <category>").requiredOption("--amount <amount>").option("--month <month>").option("--year <year>").action((o) => { try { const result = setBudget(o.category, o.amount, o.month, o.year); success(`Budget set for ${result.category}: ${money(result.amount)} (${result.month}/${result.year})`); } catch (e) { fail(e); } });
budget.command("list").description("List budgets").option("--month <month>").option("--year <year>").action((o) => { try { const items = listBudgets(o.month, o.year); if (!items.length) return console.log("No budgets found."); console.table(items.map((item) => ({ Category: item.category, Month: item.month || "legacy", Year: item.year || "legacy", Budget: money(item.amount) }))); } catch (e) { fail(e); } });
budget.command("delete").description("Delete a budget").requiredOption("--category <category>").option("--month <month>").option("--year <year>").action((o) => { try { deleteBudget(o.category, o.month, o.year); success(`Deleted ${o.category} budget.`); } catch (e) { fail(e); } });

program.command("export <path>").description("Export expenses as JSON or CSV").action((path) => { try { success(`Exported expenses to ${exportExpenses(path)}`); } catch (e) { fail(e); } });
program.command("import <path>").description("Import expenses from JSON or CSV").option("--replace", "Replace existing expenses").action((path, options) => { try { success(`Imported ${importExpenses(path, options.replace)} expense(s).`); } catch (e) { fail(e); } });
program.command("clear").description("Delete all expenses (budgets are retained)").option("--budgets", "Also delete budgets").option("--yes", "Skip confirmation").action(async (options) => {
  try {
    if (!await confirm("Delete all expenses?", options.yes)) return console.log("Deletion cancelled.");
    const count = clearExpenses();
    if (options.budgets) require("./storage").saveBudgets([]);
    success(`Cleared ${count} expense(s).`);
  } catch (e) { fail(e); }
});

program.parseAsync().catch(fail);
