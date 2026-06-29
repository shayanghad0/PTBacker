import { ParsedPriceData } from '../types';

export interface ParseResult {
  success: boolean;
  data?: ParsedPriceData;
  error?: string;
}

/**
 * Parses raw JSON text, extracts sequential price keys like p1, p2... pN,
 * sorts them numerically by their suffix number, and extracts ordered price array.
 */
export function parsePriceJson(jsonText: string, minRequiredData: number = 20): ParseResult {
  let rawObj: unknown;
  
  try {
    rawObj = JSON.parse(jsonText);
  } catch (err) {
    return {
      success: false,
      error: `Invalid JSON syntax: ${(err as Error).message}. Please ensure your file contains valid JSON.`
    };
  }

  if (!rawObj || typeof rawObj !== 'object' || Array.isArray(rawObj)) {
    return {
      success: false,
      error: `Invalid JSON format: Expected a JSON object with price keys (e.g., {"p1": 100.5, "p2": 101.2}).`
    };
  }

  const entries = Object.entries(rawObj as Record<string, unknown>);
  const matchedItems: { key: string; index: number; price: number }[] = [];

  // Match keys with numeric suffix, e.g. "p1", "p2", "price_10", "1"
  const suffixRegex = /^([a-zA-Z_-]*)(\d+)$/;

  for (const [key, rawVal] of entries) {
    const match = key.match(suffixRegex);
    if (match) {
      const numericSuffix = parseInt(match[2], 10);
      let priceVal: number | null = null;

      if (typeof rawVal === 'number' && Number.isFinite(rawVal)) {
        priceVal = rawVal;
      } else if (typeof rawVal === 'string' && rawVal.trim() !== '') {
        const parsed = Number(rawVal);
        if (Number.isFinite(parsed)) {
          priceVal = parsed;
        }
      }

      if (priceVal !== null) {
        matchedItems.push({
          key,
          index: numericSuffix,
          price: priceVal
        });
      }
    }
  }

  if (matchedItems.length === 0) {
    return {
      success: false,
      error: `No valid sequential price keys found. Ensure keys end with a sequential number (e.g., "p1": 100, "p2": 101.5) and values are numbers.`
    };
  }

  // Sort numerically by their suffix number (e.g., p1, p2, p3 ... p10, p11)
  matchedItems.sort((a, b) => a.index - b.index);

  const keys = matchedItems.map(item => item.key);
  const prices = matchedItems.map(item => item.price);

  if (prices.length < minRequiredData) {
    return {
      success: false,
      error: `Insufficient data for backtest: Found ${prices.length} price points, but at least ${minRequiredData} sequential prices are required for the slow moving average.`
    };
  }

  return {
    success: true,
    data: {
      keys,
      prices,
      items: matchedItems
    }
  };
}
