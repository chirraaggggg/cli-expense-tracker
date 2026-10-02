const fs = require("fs");
const path = require("path");
const { getExpenses, saveExpenses } = require("./storage");
const { validateExpense } = require("./validation");

function exportExpenses(outputPath) {
  if (!outputPath) throw new Error("Output path is required");
  const expenses = getExpenses();
  const target = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (path.extname(target).toLowerCase() === ".csv") {
    const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = ["id,date,description,category,amount", ...expenses.map((item) =>
      [item.id, item.date, item.description, item.category, item.amount].map(escape).join(",")
    )];
    fs.writeFileSync(target, `${rows.join("\n")}\n`, "utf8");
  } else {
    fs.writeFileSync(target, JSON.stringify(expenses, null, 2), "utf8");
  }
  return target;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length || lines[0].toLowerCase() !== "id,date,description,category,amount") throw new Error("CSV must start with id,date,description,category,amount");
  return lines.slice(1).map((line, index) => {
    const fields = [];
    let field = ""; let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { fields.push(field); field = ""; }
      else field += char;
    }
    if (quoted) throw new Error(`Malformed CSV on line ${index + 2}`);
    fields.push(field);
    if (fields.length !== 5) throw new Error(`Malformed CSV on line ${index + 2}`);
    return { id: fields[0], date: fields[1], description: fields[2], category: fields[3], amount: fields[4] };
  });
}

function importExpenses(inputPath, replace = false) {
  if (!inputPath) throw new Error("Input path is required");
  const target = path.resolve(inputPath);
  let parsed;
  try {
    const text = fs.readFileSync(target, "utf8");
    parsed = path.extname(target).toLowerCase() === ".csv" ? parseCsv(text) : JSON.parse(text);
  } catch (error) {
    throw new Error(`Unable to read import file: ${error.message}`);
  }
  if (!Array.isArray(parsed)) throw new Error("Import file must contain an array of expenses");
  const validated = parsed.map((item) => validateExpense(item));
  const ids = new Set();
  for (const item of validated) {
    if (ids.has(item.id)) throw new Error(`Duplicate expense ID: ${item.id}`);
    ids.add(item.id);
  }
  const existing = getExpenses();
  if (!replace && validated.some((item) => existing.some((old) => Number(old.id) === item.id))) {
    throw new Error("Import contains an expense ID that already exists");
  }
  saveExpenses(replace ? validated : [...existing, ...validated]);
  return validated.length;
}

module.exports = { exportExpenses, importExpenses };
