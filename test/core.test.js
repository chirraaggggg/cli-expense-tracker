const test = require("node:test");
const assert = require("node:assert/strict");
const { filterExpenses, sortExpenses } = require("../src/filters");
const { validateAmount, validateDate, validateMonth, validateExpense } = require("../src/validation");
const { summarize } = require("../src/expenseManager");

const expenses = [
  { id: 1, description: "Lunch", amount: 250, category: "food", date: "2026-10-01" },
  { id: 2, description: "Bus", amount: 100, category: "transport", date: "2026-10-02" },
  { id: 3, description: "Dinner", amount: 500, category: "food", date: "2026-11-01" },
];

test("filters by dates, month, category, and search", () => {
  assert.equal(filterExpenses(expenses, { month: 10, search: "FOOD" }).length, 1);
  assert.equal(filterExpenses(expenses, { from: "2026-10-02", to: "2026-10-31" }).length, 1);
});

test("sorts without mutating the source", () => {
  const sorted = sortExpenses(expenses, "amount-desc");
  assert.deepEqual(sorted.map((item) => item.amount), [500, 250, 100]);
  assert.deepEqual(expenses.map((item) => item.amount), [250, 100, 500]);
});

test("validates amounts, dates, months, and imported expenses", () => {
  assert.throws(() => validateAmount(0), /greater than 0/);
  assert.throws(() => validateDate("2026-02-30"), /Invalid date/);
  assert.throws(() => validateMonth(13), /between 1 and 12/);
  assert.throws(() => validateExpense({ ...expenses[0], id: 0 }), /positive integer/);
});

test("summarizes totals and categories", () => {
  const summary = summarize(expenses);
  assert.equal(summary.count, 3);
  assert.equal(summary.total, 850);
  assert.equal(summary.average, 850 / 3);
  assert.deepEqual(summary.byCategory, { food: 750, transport: 100 });
});
