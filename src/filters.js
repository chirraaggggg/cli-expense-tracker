const { validateDate, validateMonth, validateYear } = require("./validation");

function filterExpenses(expenses, filters = {}) {
  const from = filters.from === undefined ? undefined : validateDate(filters.from);
  const to = filters.to === undefined ? undefined : validateDate(filters.to);
  if (from && to && from > to) throw new Error("The from date cannot be after the to date");
  const month = filters.month === undefined ? undefined : validateMonth(filters.month);
  const year = filters.year === undefined ? undefined : validateYear(filters.year);
  const category = filters.category && filters.category.trim().toLowerCase();
  const search = filters.search && filters.search.trim().toLowerCase();

  return expenses.filter((expense) => {
    const date = expense.date;
    if (from && date < from) return false;
    if (to && date > to) return false;
    if (month !== undefined && (!date || Number(date.slice(5, 7)) !== month)) return false;
    if (year !== undefined && (!date || Number(date.slice(0, 4)) !== year)) return false;
    if (category && (expense.category || "other").toLowerCase() !== category) return false;
    if (search && !`${expense.description} ${expense.category || "other"}`.toLowerCase().includes(search)) return false;
    return true;
  });
}

function sortExpenses(expenses, sort) {
  const result = [...expenses];
  const sorters = {
    amount: (a, b) => Number(a.amount) - Number(b.amount),
    "amount-desc": (a, b) => Number(b.amount) - Number(a.amount),
    date: (a, b) => a.date.localeCompare(b.date),
    "date-desc": (a, b) => b.date.localeCompare(a.date),
    description: (a, b) => a.description.localeCompare(b.description),
  };
  if (sort && !sorters[sort]) throw new Error("Invalid sort. Use amount, amount-desc, date, date-desc, or description");
  return sorters[sort] ? result.sort(sorters[sort]) : result.sort((a, b) => Number(a.id) - Number(b.id));
}

module.exports = { filterExpenses, sortExpenses };
