# CLI Expense Tracker

A production-ready Node.js CLI for recording expenses, tracking monthly category budgets, and understanding spending with statistics and reports. Data is stored locally in JSON files.

## Features

- Add, update, list, search, sort, and safely delete expenses
- Month, year, date-range, category, and text filtering
- Statistics, category totals, monthly reports, and budget warnings
- Monthly/yearly category budgets with legacy budget compatibility
- JSON and CSV import/export with validation and duplicate protection
- Interactive add/delete/clear flows and script-friendly `--yes`
- INR formatting and readable empty/error states

## Installation

```bash
git clone <your-repository-url>
cd cli-expense-tracker
npm install
npm link
```

## Usage

```bash
expense add --description "Lunch" --amount 250 --category food
expense add
expense list --category food --sort amount-desc
expense list --from 2026-10-01 --to 2026-10-31
expense list --search lunch
expense update --id 1 --amount 300
expense delete --id 1 --yes
expense summary --month 10 --year 2026
expense stats --from 2026-10-01 --to 2026-10-31
expense categories
expense report
expense report --year 2026
expense budget set --category food --amount 5000 --month 10 --year 2026
expense budget list --month 10 --year 2026
expense budget delete --category food --month 10 --year 2026
expense export ./backup/expenses.csv
expense import ./backup/expenses.csv --replace
expense clear --yes
```

Run `expense --help` or `expense <command> --help` for all options.

## Architecture

```text
CLI (src/index.js)
        ↓
Business logic (expenseManager, budgetManager, reportManager)
        ↓
Shared validation/filtering and import/export
        ↓
JSON storage (data/)
```

## Data model

Expenses contain `id`, `date`, `description`, `category`, and positive `amount`.
Budgets contain `category`, `month`, `year`, and positive `amount`. Legacy budgets without a month/year remain readable and are treated as reusable category budgets.

## Testing

```bash
npm test
```

Tests use in-memory fixtures and do not modify the real `data/` directory.

## Tech stack

- Node.js
- JavaScript
- Commander.js
- Node built-in test runner

## Future improvements

- Optional encrypted/cloud backup
- Configurable currencies and locale formatting
