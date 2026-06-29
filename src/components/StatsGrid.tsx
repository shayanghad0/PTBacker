import React from 'react';
import { BacktestResult } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Repeat, ShieldAlert, Award, BarChart3, Target } from 'lucide-react';

interface StatsGridProps {
  result: BacktestResult;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ result }) => {
  const isPositiveReturn = result.totalReturnPercent >= 0;
  const isBenchmarkBeat = result.totalReturnPercent >= result.buyAndHoldReturnPercent;

  return (
    <div className="space-y-4">
      {/* First Row: Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Final Portfolio Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Final Portfolio Value
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isPositiveReturn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              ${result.finalPortfolioValue.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              from ${result.initialBalance.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className={`font-semibold px-2 py-0.5 rounded-md ${
              result.finalPortfolioValue - result.initialBalance >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {result.finalPortfolioValue - result.initialBalance >= 0 ? '+' : ''}
              ${(result.finalPortfolioValue - result.initialBalance).toFixed(2)} P&L
            </span>
          </div>
        </div>

        {/* Card 2: Total Return % */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Strategy Return
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isPositiveReturn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {isPositiveReturn ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-bold font-mono ${
              isPositiveReturn ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isPositiveReturn ? '+' : ''}{result.totalReturnPercent.toFixed(2)}%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>vs Buy & Hold:</span>
            <span className={`font-mono font-semibold ${isBenchmarkBeat ? 'text-emerald-400' : 'text-amber-400'}`}>
              {result.buyAndHoldReturnPercent >= 0 ? '+' : ''}{result.buyAndHoldReturnPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Card 3: Total Trades & Win Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Executed Trades
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {result.totalTrades}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({result.buyTradesCount} BUY / {result.sellTradesCount} SELL)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Closed Win Rate:</span>
            <span className="font-mono font-semibold text-cyan-400">
              {result.sellTradesCount > 0 ? `${result.winRatePercent.toFixed(1)}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Card 4: Risk / Drawdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Maximum Drawdown
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              -{result.maxDrawdownPercent.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (-${result.maxDrawdownDollars.toFixed(2)})
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Profitable Sells:</span>
            <span className="font-mono font-semibold text-slate-200">
              {result.winningTradesCount} / {result.sellTradesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Second Row: Advanced Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profit Factor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Profit Factor
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-bold font-mono ${
              result.profitFactor >= 1.5 ? 'text-emerald-400' : 
              result.profitFactor >= 1 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {result.profitFactor === Infinity ? '∞' : result.profitFactor.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Gross Profit:</span>
            <span className="font-mono text-emerald-400">+${result.totalGrossProfit.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Loss:</span>
            <span className="font-mono text-rose-400">-${result.totalGrossLoss.toFixed(2)}</span>
          </div>
        </div>

        {/* Average Win */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average Win
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              ${result.averageWin.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Winning Trades:</span>
            <span className="font-mono">{result.winningTradesCount}</span>
          </div>
        </div>

        {/* Average Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average Loss
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-rose-400">
              ${result.averageLoss.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Losing Trades:</span>
            <span className="font-mono">{result.losingTradesCount}</span>
          </div>
        </div>

        {/* Expectancy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Expectancy (per Trade)
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-bold font-mono ${
              result.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {result.expectancy >= 0 ? '+' : ''}${result.expectancy.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Total Trades:</span>
            <span className="font-mono">{result.sellTradesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};