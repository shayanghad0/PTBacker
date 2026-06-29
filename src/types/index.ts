export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  type: TradeType;
  price: number;
  amount: number;       // Units bought/sold
  value: number;        // Total dollar value of trade ($)
  index: number;        // Time index (second)
  keyName: string;      // Original JSON key (e.g., 'p14')
  portfolioAfter: number; // Total portfolio equity immediately after trade
  profit?: number;      // Dollar profit/loss (only for SELL trades)
  profitPercent?: number; // % profit/loss (only for SELL trades)
}

export interface StrategyState {
  prices: readonly number[];
  holdings: number;
  balance: number;
  portfolioValue: number;
  tradesCount: number;
  customParams?: Record<string, number>;
}

export type StrategyAction = 'buy' | 'sell' | 'hold';

export type StrategyFunction = (
  price: number,
  index: number,
  state: StrategyState
) => StrategyAction;

export interface BacktestConfig {
  initialBalance: number;
  minTradeSize: number;
  fastPeriod: number;
  slowPeriod: number;
  strategyType: 'ma_crossover' | 'rsi_reversion' | 'momentum_breakout';
  rsiPeriod?: number;
  rsiBuyThreshold?: number;
  rsiSellThreshold?: number;
}

export interface BacktestDataPoint {
  index: number;
  key: string;
  price: number;
  fastMA: number | null;
  slowMA: number | null;
  rsi?: number | null;
  portfolioValue: number;
  holdings: number;
  balance: number;
  trade?: Trade;
}

export interface BacktestResult {
  initialBalance: number;
  finalPortfolioValue: number;
  totalReturnPercent: number;
  totalTrades: number;
  buyTradesCount: number;
  sellTradesCount: number;
  winningTradesCount: number;
  losingTradesCount: number;
  winRatePercent: number;
  maxDrawdownPercent: number;
  maxDrawdownDollars: number;
  buyAndHoldReturnPercent: number;
  buyAndHoldFinalValue: number;
  trades: Trade[];
  timeline: BacktestDataPoint[];
}

export interface ParsedPriceData {
  keys: string[];
  prices: number[];
  items: { key: string; index: number; price: number }[];
}
