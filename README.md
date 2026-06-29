# QuantPulse - JSON Price Backtesting Engine

**Browser-based backtesting terminal for sequential price data with moving average crossover strategies.**

## Quick Start

```bash
npm install
npm run dev
```

## Features

- **Upload JSON** files with sequential price keys (`p1`, `p2`, ... `pN`)
- **5 preset datasets** for instant testing (bullish, volatile, crypto, bear, quick test)
- **Interactive charts** with price, moving averages, and trade signals
- **Performance metrics**: P&L, win rate, drawdown, equity curve
- **Trade ledger** with CSV export

## JSON Format

```json
{
  "p1": 100.0,
  "p2": 100.5,
  "p3": 101.2
}
```

Keys must end with a numeric suffix (e.g., `p1`, `price_10`, `1`).

## Tech Stack

- React 19 + TypeScript
- Vite + Tailwind CSS 4
- Pure client-side engine (no server)
