import React, { useState, useMemo } from 'react';
import { BacktestDataPoint } from '../types';
import { LineChart, Eye, EyeOff } from 'lucide-react';

interface PriceChartProps {
  timeline: BacktestDataPoint[];
  fastPeriod: number;
  slowPeriod: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ timeline, fastPeriod, slowPeriod }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showFastMA, setShowFastMA] = useState(true);
  const [showSlowMA, setShowSlowMA] = useState(true);
  const [showTrades, setShowTrades] = useState(true);

  const chartBounds = useMemo(() => {
    if (timeline.length === 0) return { minPrice: 0, maxPrice: 100, range: 100 };
    let min = Infinity;
    let max = -Infinity;
    for (const pt of timeline) {
      if (pt.price < min) min = pt.price;
      if (pt.price > max) max = pt.price;
      if (showFastMA && pt.fastMA !== null) {
        if (pt.fastMA < min) min = pt.fastMA;
        if (pt.fastMA > max) max = pt.fastMA;
      }
      if (showSlowMA && pt.slowMA !== null) {
        if (pt.slowMA < min) min = pt.slowMA;
        if (pt.slowMA > max) max = pt.slowMA;
      }
    }
    const padding = (max - min) * 0.08 || 5;
    return {
      minPrice: Math.max(0, min - padding),
      maxPrice: max + padding,
      range: (max + padding) - Math.max(0, min - padding) || 1
    };
  }, [timeline, showFastMA, showSlowMA]);

  if (timeline.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No timeline data available to chart.
      </div>
    );
  }

  const width = 800;
  const height = 320;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (timeline.length <= 1) return paddingLeft;
    return paddingLeft + (index / (timeline.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const norm = (val - chartBounds.minPrice) / chartBounds.range;
    return paddingTop + chartHeight - norm * chartHeight;
  };

  // Build SVG paths
  const pricePoints = timeline.map((pt, i) => `${getX(i).toFixed(1)},${getY(pt.price).toFixed(1)}`).join(' ');
  
  const fastMapPoints = timeline
    .map((pt, i) => pt.fastMA !== null ? `${getX(i).toFixed(1)},${getY(pt.fastMA).toFixed(1)}` : null)
    .filter(Boolean)
    .join(' ');

  const slowMapPoints = timeline
    .map((pt, i) => pt.slowMA !== null ? `${getX(i).toFixed(1)},${getY(pt.slowMA).toFixed(1)}` : null)
    .filter(Boolean)
    .join(' ');

  const hoveredPoint = hoverIndex !== null && timeline[hoverIndex] ? timeline[hoverIndex] : timeline[timeline.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            <span>Price & Moving Average Signals</span>
          </h3>
          <p className="text-xs text-slate-400">
            Interactive chart showing 1-second price bars and crossover triggers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowFastMA(!showFastMA)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-mono ${
              showFastMA
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {showFastMA ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Fast MA ({fastPeriod})</span>
          </button>

          <button
            onClick={() => setShowSlowMA(!showSlowMA)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-mono ${
              showSlowMA
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {showSlowMA ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Slow MA ({slowPeriod})</span>
          </button>

          <button
            onClick={() => setShowTrades(!showTrades)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-mono ${
              showTrades
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {showTrades ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Trade Signals</span>
          </button>
        </div>
      </div>

      {/* Hover Info Banner */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Time Interval</span>
          <p className="font-mono font-bold text-slate-200">
            {hoveredPoint?.key} <span className="text-slate-400 text-[11px]">({hoveredPoint?.index + 1}s)</span>
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Price</span>
          <p className="font-mono font-bold text-cyan-400">
            ${hoveredPoint?.price.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Fast MA ({fastPeriod})</span>
          <p className="font-mono font-bold text-amber-400">
            {hoveredPoint?.fastMA !== null ? `$${hoveredPoint?.fastMA.toFixed(2)}` : 'N/A'}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Slow MA ({slowPeriod})</span>
          <p className="font-mono font-bold text-purple-400">
            {hoveredPoint?.slowMA !== null ? `$${hoveredPoint?.slowMA.toFixed(2)}` : 'N/A'}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Portfolio Value</span>
          <p className="font-mono font-bold text-emerald-400">
            ${hoveredPoint?.portfolioValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[360px] overflow-visible"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const targetX = relX * width;
            if (targetX < paddingLeft || targetX > width - paddingRight) return;
            const normalized = (targetX - paddingLeft) / chartWidth;
            const idx = Math.round(normalized * (timeline.length - 1));
            const clamped = Math.max(0, Math.min(timeline.length - 1, idx));
            setHoverIndex(clamped);
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + pct * chartHeight;
            const val = chartBounds.maxPrice - pct * chartBounds.range;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  ${val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Price Area Fill */}
          <path
            d={`M ${paddingLeft},${paddingTop + chartHeight} L ${pricePoints} L ${getX(timeline.length - 1)},${paddingTop + chartHeight} Z`}
            fill="url(#priceAreaGrad)"
          />

          {/* Price Line */}
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinejoin="round"
            points={pricePoints}
          />

          {/* Slow MA Line */}
          {showSlowMA && slowMapPoints && (
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="2 2"
              strokeLinejoin="round"
              points={slowMapPoints}
            />
          )}

          {/* Fast MA Line */}
          {showFastMA && fastMapPoints && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinejoin="round"
              points={fastMapPoints}
            />
          )}

          {/* Trade Markers */}
          {showTrades && timeline.map((pt, i) => {
            if (!pt.trade) return null;
            const x = getX(i);
            const y = getY(pt.price);
            const isBuy = pt.trade.type === 'BUY';

            return (
              <g key={`trade-${i}`} className="cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={isBuy ? '#10b981' : '#f43f5e'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={isBuy ? y + 18 : y - 10}
                  textAnchor="middle"
                  fill={isBuy ? '#10b981' : '#f43f5e'}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {isBuy ? 'BUY' : 'SELL'}
                </text>
              </g>
            );
          })}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + chartHeight}
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(timeline[hoverIndex].price)}
                r="4"
                fill="#38bdf8"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
