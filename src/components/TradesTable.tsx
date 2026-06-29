import React, { useState } from 'react';
import { Trade, BacktestConfig } from '../types';
import { Table, Download, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TradesTableProps {
  trades: Trade[];
  strategyType?: string;
  config?: BacktestConfig;
}

export const TradesTable: React.FC<TradesTableProps> = ({ trades, strategyType = 'ma_crossover', config }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrades = trades.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        t.keyName.toLowerCase().includes(term) ||
        t.type.toLowerCase().includes(term) ||
        t.price.toString().includes(term)
      );
    }
    return true;
  });

  const getStrategyName = (type: string) => {
    const map: Record<string, string> = {
      ma_crossover: 'MA Crossover',
      rsi_reversion: 'RSI Mean Reversion',
      momentum_breakout: 'Momentum Breakout',
    };
    return map[type] || type;
  };

  const getSetup = (type: string) => {
    const map: Record<string, string> = {
      ma_crossover: 'crossover',
      rsi_reversion: 'rsi',
      momentum_breakout: 'breakout',
    };
    return map[type] || 'signal';
  };

  const getTradeType = (type: string, cfg?: BacktestConfig) => {
    if (type === 'ma_crossover') {
      return `SMA_${cfg?.fastPeriod || 5}_${cfg?.slowPeriod || 20}`;
    } else if (type === 'rsi_reversion') {
      return `RSI_${cfg?.rsiPeriod || 14}_${cfg?.rsiBuyThreshold || 30}_${cfg?.rsiSellThreshold || 70}`;
    } else if (type === 'momentum_breakout') {
      return `Momentum_${cfg?.momentumLookback || 10}`;
    }
    return type;
  };

  const exportCsv = () => {
    if (trades.length === 0) return;

    // Format current date/time as YYYY-MM-DD HH:MM:SS
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr =
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const allTrades = trades;
    const headers = [
      'date',
      'symbol',
      'direction',
      'entryPrice',
      'exitPrice',
      'quantity',
      'pnl',
      'currency',
      'setup',
      'emotion',
      'risk',
      'strategy',
      'notes',
      'trade_type',
    ];

    const strategyName = getStrategyName(strategyType);
    const setup = getSetup(strategyType);
    const tradeType = getTradeType(strategyType, config);

    const rows = allTrades.map((trade) => {
      const isBuy = trade.type === 'BUY';
      const isSell = trade.type === 'SELL';

      let entryPrice: number;
      let exitPrice: number;
      let pnl: number;

      if (isSell) {
        entryPrice = trade.price - (trade.profit ?? 0) / trade.amount;
        exitPrice = trade.price;
        pnl = trade.profit ?? 0;
      } else {
        entryPrice = trade.price;
        exitPrice = trade.price;
        pnl = 0;
      }

      const symbol = 'BACKTEST';
      const direction = isBuy ? 'buy' : 'sell';
      const currency = 'USD';
      const emotion = '';
      const risk = '';
      const notes = `Backtest ${strategyName} on ${symbol}`;

      return [
        dateStr, // Use the same export timestamp for all rows
        symbol,
        direction,
        entryPrice.toFixed(4),
        exitPrice.toFixed(4),
        trade.amount.toFixed(4),
        pnl.toFixed(2),
        currency,
        setup,
        emotion,
        risk,
        strategyName,
        notes,
        tradeType,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `backtest_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ... (the rest of the component – table rendering – remains exactly the same as before)
  return (
    <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-800 dark:border-slate-800 border-gray-300 rounded-2xl shadow-xl overflow-hidden transition-colors">
      {/* Top Controls */}
      <div className="p-6 border-b border-slate-800 dark:border-slate-800 border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 text-gray-900 flex items-center space-x-2">
            <Table className="w-5 h-5 text-cyan-400" />
            <span>Executed Trades Ledger ({trades.length})</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 text-gray-500 mt-0.5">
            Complete sequential breakdown of every buy and sell position switch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 bg-slate-950 dark:bg-slate-950 bg-gray-100 p-1 rounded-xl border border-slate-800 dark:border-slate-800 border-gray-300 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 text-gray-500 ml-2 mr-1" />
            {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-mono font-semibold transition-colors cursor-pointer ${
                  filterType === type
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 dark:text-slate-400 text-gray-500 hover:text-slate-200 dark:hover:text-slate-200 hover:text-gray-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search key (e.g. p14)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 dark:bg-slate-950 bg-white border border-slate-800 dark:border-slate-800 border-gray-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 dark:text-slate-100 text-gray-900 placeholder-slate-500 dark:placeholder-slate-500 placeholder-gray-400 focus:outline-none focus:border-cyan-500 w-44"
          />

          <button
            onClick={exportCsv}
            disabled={trades.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-800 bg-gray-200 hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-gray-300 disabled:opacity-50 text-slate-200 dark:text-slate-200 text-gray-800 border border-slate-700 dark:border-slate-700 border-gray-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {trades.length === 0 ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-400 text-gray-500 text-sm">
          No trades triggered during this simulation with the selected parameters. Try adjusting MA periods or testing another dataset.
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-400 text-gray-500 text-sm">
          No trades match your current filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/90 dark:bg-slate-950/90 bg-gray-100/90 border-b border-slate-800 dark:border-slate-800 border-gray-300 sticky top-0 z-10 text-slate-400 dark:text-slate-400 text-gray-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 font-mono">#</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4 font-mono">Time Index</th>
                <th className="py-3.5 px-4 font-mono">Execution Price</th>
                <th className="py-3.5 px-4 font-mono">Units (Amount)</th>
                <th className="py-3.5 px-4 font-mono">Total Value</th>
                <th className="py-3.5 px-4 font-mono">Portfolio After</th>
                <th className="py-3.5 px-4 text-right">Closed Trade P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 dark:divide-slate-800/60 divide-gray-300/60 font-mono text-slate-200 dark:text-slate-200 text-gray-800">
              {filteredTrades.map((trade, idx) => {
                const isBuy = trade.type === 'BUY';
                const hasProfit = trade.profit !== undefined;
                const isProfitPositive = (trade.profit ?? 0) >= 0;

                return (
                  <tr key={trade.id} className="hover:bg-slate-800/40 dark:hover:bg-slate-800/40 hover:bg-gray-200/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-500 text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isBuy
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{trade.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-cyan-400 font-semibold">{trade.keyName}</span>{' '}
                      <span className="text-slate-500 dark:text-slate-500 text-gray-500">({trade.index + 1}s)</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 dark:text-slate-100 text-gray-900">
                      ${trade.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 dark:text-slate-300 text-gray-700">{trade.amount.toFixed(4)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200 dark:text-slate-200 text-gray-800">
                      ${trade.value.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">${trade.portfolioAfter.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      {hasProfit ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold ${
                            isProfitPositive
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {isProfitPositive ? '+' : ''}${trade.profit?.toFixed(2)}{' '}
                          <span className="text-[10px] opacity-80">
                            ({isProfitPositive ? '+' : ''}{trade.profitPercent?.toFixed(1)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-500 text-gray-500 italic text-[11px]">— Open Position</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};