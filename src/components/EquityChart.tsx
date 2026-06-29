import React, { useState, useMemo } from 'react';
import { BacktestDataPoint } from '../types';
import { TrendingUp } from 'lucide-react';

interface EquityChartProps {
  timeline: BacktestDataPoint[];
  initialBalance: number;
}

export const EquityChart: React.FC<EquityChartProps> = ({ timeline, initialBalance }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chartBounds = useMemo(() => {
    if (timeline.length === 0) return { minVal: 0, maxVal: 100, range: 100 };
    const firstPrice = timeline[0].price;
    const initialUnits = firstPrice > 0 ? initialBalance / firstPrice : 0;

    let min = initialBalance;
    let max = initialBalance;

    for (const pt of timeline) {
      if (pt.portfolioValue < min) min = pt.portfolioValue;
      if (pt.portfolioValue > max) max = pt.portfolioValue;

      const bhValue = initialUnits * pt.price;
      if (bhValue < min) min = bhValue;
      if (bhValue > max) max = bhValue;
    }
    const padding = (max - min) * 0.08 || 5;
    return {
      minVal: Math.max(0, min - padding),
      maxVal: max + padding,
      range: (max + padding) - Math.max(0, min - padding) || 1
    };
  }, [timeline, initialBalance]);

  if (timeline.length === 0) return null;

  const width = 800;
  const height = 280;
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
    const norm = (val - chartBounds.minVal) / chartBounds.range;
    return paddingTop + chartHeight - norm * chartHeight;
  };

  const firstPrice = timeline[0].price;
  const initialUnits = firstPrice > 0 ? initialBalance / firstPrice : 0;

  const strategyPoints = timeline
    .map((pt, i) => `${getX(i).toFixed(1)},${getY(pt.portfolioValue).toFixed(1)}`)
    .join(' ');

  const buyHoldPoints = timeline
    .map((pt, i) => `${getX(i).toFixed(1)},${getY(initialUnits * pt.price).toFixed(1)}`)
    .join(' ');

  const hoveredPoint = hoverIndex !== null && timeline[hoverIndex] ? timeline[hoverIndex] : timeline[timeline.length - 1];
  const hoveredBHValue = hoveredPoint ? initialUnits * hoveredPoint.price : initialBalance;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Portfolio Equity Curve Comparison</span>
          </h3>
          <p className="text-xs text-slate-400">
            Strategy active equity (green) vs Buy & Hold passive investment (slate)
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
            <span className="text-slate-300">MA Crossover Strategy</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1.5 bg-slate-500 rounded-full inline-block"></span>
            <span className="text-slate-400">Buy & Hold</span>
          </div>
        </div>
      </div>

      {/* Hover Info Banner */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Time Index</span>
          <p className="font-mono font-bold text-slate-200">
            {hoveredPoint?.key} <span className="text-slate-400 text-[11px]">({hoveredPoint?.index + 1}s)</span>
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Strategy Equity</span>
          <p className="font-mono font-bold text-emerald-400">
            ${hoveredPoint?.portfolioValue.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Buy & Hold Equity</span>
          <p className="font-mono font-bold text-slate-400">
            ${hoveredBHValue.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Strategy Alpha ($)</span>
          <p className={`font-mono font-bold ${
            (hoveredPoint?.portfolioValue ?? 0) >= hoveredBHValue ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {((hoveredPoint?.portfolioValue ?? 0) - hoveredBHValue >= 0) ? '+' : ''}
            ${((hoveredPoint?.portfolioValue ?? 0) - hoveredBHValue).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px] overflow-visible"
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
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = paddingTop + pct * chartHeight;
            const val = chartBounds.maxVal - pct * chartBounds.range;
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

          {/* Strategy Area Fill */}
          <path
            d={`M ${paddingLeft},${paddingTop + chartHeight} L ${strategyPoints} L ${getX(timeline.length - 1)},${paddingTop + chartHeight} Z`}
            fill="url(#equityGrad)"
          />

          {/* Buy & Hold Line */}
          <polyline
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="3 3"
            strokeLinejoin="round"
            points={buyHoldPoints}
          />

          {/* Strategy Equity Line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinejoin="round"
            points={strategyPoints}
          />

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
                cy={getY(timeline[hoverIndex].portfolioValue)}
                r="4"
                fill="#10b981"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
