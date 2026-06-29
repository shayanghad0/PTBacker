import React, { useState } from 'react';
import { Trade } from '../types';
import { Table, Download, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TradesTableProps {
  trades: Trade[];
}

export const TradesTable: React.FC<TradesTableProps> = ({ trades }) => {
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

  const exportCsv = () => {
    if (trades.length === 0) return;
    const headers = ['Trade ID', 'Type', 'Time Index (s)', 'JSON Key', 'Price ($)', 'Units (Amount)', 'Value ($)', 'Portfolio After ($)', 'Profit/Loss ($)'];
    const rows = trades.map((t) => [
      t.id,
      t.type,
      t.index + 1,
      t.keyName,
      t.price.toFixed(4),
      t.amount.toFixed(4),
      t.value.toFixed(2),
      t.portfolioAfter.toFixed(2),
      t.profit !== undefined ? t.profit.toFixed(2) : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `backtest_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Top Controls */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Table className="w-5 h-5 text-cyan-400" />
            <span>Executed Trades Ledger ({trades.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete sequential breakdown of every buy and sell position switch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-mono font-semibold transition-colors cursor-pointer ${
                  filterType === type
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
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
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
          />

          <button
            onClick={exportCsv}
            disabled={trades.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {trades.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          No trades triggered during this simulation with the selected parameters. Try adjusting MA periods or testing another dataset.
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          No trades match your current filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-10 text-slate-400 uppercase tracking-wider font-semibold">
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
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {filteredTrades.map((trade, idx) => {
                const isBuy = trade.type === 'BUY';
                const hasProfit = trade.profit !== undefined;
                const isProfitPositive = (trade.profit ?? 0) >= 0;

                return (
                  <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        isBuy
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{trade.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-cyan-400 font-semibold">{trade.keyName}</span>{' '}
                      <span className="text-slate-500">({trade.index + 1}s)</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      ${trade.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {trade.amount.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      ${trade.value.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">
                      ${trade.portfolioAfter.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasProfit ? (
                        <span className={`inline-block px-2 py-0.5 rounded font-bold ${
                          isProfitPositive
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {isProfitPositive ? '+' : ''}${trade.profit?.toFixed(2)}{' '}
                          <span className="text-[10px] opacity-80">
                            ({isProfitPositive ? '+' : ''}{trade.profitPercent?.toFixed(1)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">— Open Position</span>
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
