/**
 * useCurrency — fetches the platform currency from the public /settings API,
 * caches in localStorage with a 5-minute TTL so changes take effect quickly.
 *
 * Usage:
 *   const { symbol, code, fmt } = useCurrency()
 *   fmt(9999)  →  "Rs. 9,999.00"  (LKR)
 *            →  "$ 9,999.00"    (USD)
 *
 * To force a refresh (e.g. after admin saves settings):
 *   import { bustCurrencyCache } from '@/hooks/useCurrency'
 *   bustCurrencyCache()
 */

import { useEffect, useState } from 'react';

const CACHE_KEY = 'mn_platform_currency';
const CACHE_TS_KEY = 'mn_platform_currency_ts';
const TTL_MS = 5 * 60 * 1000; // 5 minutes

const CURRENCY_META: Record<string, { symbol: string; locale: string }> = {
  LKR: { symbol: 'Rs.', locale: 'en-LK' },
  USD: { symbol: '$',   locale: 'en-US' },
  GBP: { symbol: '£',  locale: 'en-GB' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
  CAD: { symbol: 'C$', locale: 'en-CA' },
};

function getMeta(code: string) {
  return CURRENCY_META[code] ?? { symbol: code, locale: 'en-US' };
}

/** Call this after admin saves currency settings to force immediate refresh */
export function bustCurrencyCache() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TS_KEY);
}

async function fetchCurrency(): Promise<string> {
  if (typeof localStorage === 'undefined') return 'LKR';

  // Check cache freshness
  const cached = localStorage.getItem(CACHE_KEY);
  const cachedTs = parseInt(localStorage.getItem(CACHE_TS_KEY) ?? '0', 10);
  const now = Date.now();

  if (cached && now - cachedTs < TTL_MS) {
    return cached;
  }

  try {
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';
    const res = await fetch(`${BASE}/settings`);
    const json = await res.json();
    const code: string = json?.data?.platformCurrency ?? 'LKR';
    localStorage.setItem(CACHE_KEY, code);
    localStorage.setItem(CACHE_TS_KEY, String(now));
    return code;
  } catch {
    // Return cached value even if stale, fall back to LKR
    return cached ?? 'LKR';
  }
}

export function useCurrency() {
  const [code, setCode] = useState<string>('LKR');

  useEffect(() => {
    fetchCurrency().then(setCode);
  }, []);

  const meta = getMeta(code);

  /** Format a number as a price string: "Rs. 9,999.00" */
  const fmt = (amount: number, opts?: { decimals?: number }) => {
    const decimals = opts?.decimals ?? 2;
    return `${meta.symbol} ${amount.toLocaleString(meta.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  return { code, symbol: meta.symbol, locale: meta.locale, fmt };
}

/** Standalone formatter when you already have the code (no hook needed) */
export function formatPrice(amount: number, currencyCode: string, decimals = 2) {
  const meta = getMeta(currencyCode);
  return `${meta.symbol} ${amount.toLocaleString(meta.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
