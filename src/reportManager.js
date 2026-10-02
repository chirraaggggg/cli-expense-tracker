const { getExpenses } = require("./storage");
const { filterExpenses } = require("./filters");
const { summarize } = require("./expenseManager");
const { getBudgetStatus } = require("./budgetManager");

function monthlyReport(year) {
  const expenses = filterExpenses(getExpenses(), { year });
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return expenses.filter((item) => Number(item.date.slice(5, 7)) === month)
      .reduce((sum, item) => sum + Number(item.amount), 0);
  });
  const nonEmpty = months.filter((amount) => amount > 0);
  const total = months.reduce((sum, amount) => sum + amount, 0);
  return { year, months, total, average: nonEmpty.length ? total / nonEmpty.length : 0, highestMonth: months.indexOf(Math.max(...months)) + 1, lowestMonth: nonEmpty.length ? months.indexOf(Math.min(...months.filter((amount) => amount > 0))) + 1 : null };
}

function periodReport(month, year) {
  const targetYear = year === undefined ? new Date().getFullYear() : Number(year);
  const targetMonth = month === undefined ? new Date().getMonth() + 1 : Number(month);
  const expenses = filterExpenses(getExpenses(), { month: targetMonth, year: targetYear });
  return { month: targetMonth, year: targetYear, summary: summarize(expenses), budgets: getBudgetStatus(targetMonth, targetYear) };
}

module.exports = { monthlyReport, periodReport };
