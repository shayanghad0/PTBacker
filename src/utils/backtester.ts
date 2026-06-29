import {
  StrategyFunction,
  StrategyState,
  BacktestResult,
  Trade,
  BacktestDataPoint,
  BacktestConfig
} from '../types';

/**
 * Pure helper to calculate Simple Moving Average (SMA)
 */
export function calculateSMA(
  prices: readonly number[],
  index: number,
  period: number
): number | null {
  if (index < 0 || index >= prices.length || index < period - 1) {
    return null;
  }
  let sum = 0;
  for (let i = index - period + 1; i <= index; i++) {
    sum += prices[i];
  }
  return sum / period;
}

/**
 * Helper to calculate RSI (Relative Strength Index)
 */
export function calculateRSI(
  prices: readonly number[],
  index: number,
  period: number = 14
): number | null {
  if (index < period) return null;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = index - period + 1; i <= index; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Default Moving Average Crossover Strategy Factory
 * Buy when fast MA crosses above slow MA, sell when it crosses below.
 */
export function createMACrossoverStrategy(
  fastPeriod: number = 5,
  slowPeriod: number = 20
): StrategyFunction {
  return (_price: number, index: number, state: StrategyState) => {
    const { prices } = state;
    
    // Need enough data for slow MA
    if (index < slowPeriod - 1) {
      return 'hold';
    }
    
    const currFast = calculateSMA(prices, index, fastPeriod);
    const currSlow = calculateSMA(prices, index, slowPeriod);
    
    if (currFast === null || currSlow === null) {
      return 'hold';
    }
    
    // At the very first valid slow MA bar, check initial stance
    if (index === slowPeriod - 1) {
      if (currFast > currSlow) {
        return 'buy';
      }
      return 'hold';
    }
    
    const prevFast = calculateSMA(prices, index - 1, fastPeriod);
    const prevSlow = calculateSMA(prices, index - 1, slowPeriod);
    
    if (prevFast === null || prevSlow === null) {
      return 'hold';
    }
    
    // Fast MA crosses above Slow MA
    if (currFast > currSlow && prevFast <= prevSlow) {
      return 'buy';
    }
    
    // Fast MA crosses below Slow MA
    if (currFast < currSlow && prevFast >= prevSlow) {
      return 'sell';
    }
    
    return 'hold';
  };
}

/**
 * RSI Mean Reversion Strategy Factory
 */
export function createRSIStrategy(
  period: number = 14,
  buyThreshold: number = 32,
  sellThreshold: number = 68
): StrategyFunction {
  return (_price: number, index: number, state: StrategyState) => {
    const rsi = calculateRSI(state.prices, index, period);
    if (rsi === null) return 'hold';
    if (rsi < buyThreshold) return 'buy';
    if (rsi > sellThreshold) return 'sell';
    return 'hold';
  };
}

/**
 * Momentum Breakout Strategy Factory
 */
export function createMomentumStrategy(lookback: number = 10): StrategyFunction {
  return (price: number, index: number, state: StrategyState) => {
    if (index < lookback) return 'hold';
    let highest = -Infinity;
    let lowest = Infinity;
    for (let i = index - lookback; i < index; i++) {
      if (state.prices[i] > highest) highest = state.prices[i];
      if (state.prices[i] < lowest) lowest = state.prices[i];
    }
    if (price > highest) return 'buy';
    if (price < lowest) return 'sell';
    return 'hold';
  };
}

/**
 * Pure function to run the backtest simulation
 */
export function runBacktest(
  prices: readonly number[],
  initialBalance: number = 50,
  minTradeSize: number = 5,
  strategy: StrategyFunction = createMACrossoverStrategy(5, 20),
  keys?: string[],
  config?: Partial<BacktestConfig>
): BacktestResult {
  const fastPeriod = config?.fastPeriod ?? 5;
  const slowPeriod = config?.slowPeriod ?? 20;
  const rsiPeriod = config?.rsiPeriod ?? 14;

  let balance = initialBalance;
  let holdings = 0;
  let lastBuyPrice = 0;
  let peakEquity = initialBalance;
  let maxDrawdownDollars = 0;
  let maxDrawdownPercent = 0;

  const trades: Trade[] = [];
  const timeline: BacktestDataPoint[] = [];

  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    const key = keys && keys[i] ? keys[i] : `p${i + 1}`;
    
    const currentEquityBefore = balance + holdings * price;
    
    const state: StrategyState = {
      prices,
      holdings,
      balance,
      portfolioValue: currentEquityBefore,
      tradesCount: trades.length,
      customParams: { fastPeriod, slowPeriod }
    };

    const action = strategy(price, i, state);
    let currentTrade: Trade | undefined = undefined;

    // Execute Trade rules: Only one position at a time (all in / all out)
    if (action === 'buy' && holdings === 0 && balance >= minTradeSize) {
      const amount = balance / price;
      const tradeValue = balance;
      holdings = amount;
      balance = 0;
      lastBuyPrice = price;

      currentTrade = {
        id: `trade-${trades.length + 1}`,
        type: 'BUY',
        price,
        amount,
        value: tradeValue,
        index: i,
        keyName: key,
        portfolioAfter: holdings * price
      };
      trades.push(currentTrade);
    } else if (action === 'sell' && holdings > 0) {
      const soldAmount = holdings;
      const tradeValue = holdings * price;
      const profit = tradeValue - (soldAmount * lastBuyPrice);
      const profitPercent = lastBuyPrice > 0 ? ((price - lastBuyPrice) / lastBuyPrice) * 100 : 0;
      
      balance = tradeValue;
      holdings = 0;

      currentTrade = {
        id: `trade-${trades.length + 1}`,
        type: 'SELL',
        price,
        amount: soldAmount,
        value: tradeValue,
        index: i,
        keyName: key,
        portfolioAfter: balance,
        profit,
        profitPercent
      };
      trades.push(currentTrade);
    }

    const currentEquityAfter = balance + holdings * price;
    
    // Update Drawdown tracking
    if (currentEquityAfter > peakEquity) {
      peakEquity = currentEquityAfter;
    } else {
      const ddDollars = peakEquity - currentEquityAfter;
      const ddPercent = peakEquity > 0 ? (ddDollars / peakEquity) * 100 : 0;
      if (ddDollars > maxDrawdownDollars) maxDrawdownDollars = ddDollars;
      if (ddPercent > maxDrawdownPercent) maxDrawdownPercent = ddPercent;
    }

    const fastMA = calculateSMA(prices, i, fastPeriod);
    const slowMA = calculateSMA(prices, i, slowPeriod);
    const rsi = calculateRSI(prices, i, rsiPeriod);

    timeline.push({
      index: i,
      key,
      price,
      fastMA,
      slowMA,
      rsi,
      portfolioValue: currentEquityAfter,
      holdings,
      balance,
      trade: currentTrade
    });
  }

  const finalPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
  const finalPortfolioValue = balance + holdings * finalPrice;
  const totalReturnPercent = initialBalance > 0 
    ? ((finalPortfolioValue - initialBalance) / initialBalance) * 100 
    : 0;

  const buyTradesCount = trades.filter(t => t.type === 'BUY').length;
  const sellTrades = trades.filter(t => t.type === 'SELL');
  const sellTradesCount = sellTrades.length;
  const winningTradesCount = sellTrades.filter(t => (t.profit ?? 0) > 0).length;
  const losingTradesCount = sellTrades.filter(t => (t.profit ?? 0) <= 0).length;
  const winRatePercent = sellTradesCount > 0 
    ? (winningTradesCount / sellTradesCount) * 100 
    : 0;

  // Buy and hold benchmark
  const firstPrice = prices.length > 0 ? prices[0] : 0;
  const buyAndHoldUnits = firstPrice > 0 ? initialBalance / firstPrice : 0;
  const buyAndHoldFinalValue = buyAndHoldUnits * finalPrice;
  const buyAndHoldReturnPercent = initialBalance > 0 
    ? ((buyAndHoldFinalValue - initialBalance) / initialBalance) * 100 
    : 0;

  return {
    initialBalance,
    finalPortfolioValue,
    totalReturnPercent,
    totalTrades: trades.length,
    buyTradesCount,
    sellTradesCount,
    winningTradesCount,
    losingTradesCount,
    winRatePercent,
    maxDrawdownPercent,
    maxDrawdownDollars,
    buyAndHoldReturnPercent,
    buyAndHoldFinalValue,
    trades,
    timeline
  };
}
