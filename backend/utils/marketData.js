const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';

function hasFetch() {
  return typeof fetch === 'function';
}

async function fetchJson(url, headers = {}) {
  if (!hasFetch()) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url, headers = {}) {
  if (!hasFetch()) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseCsvRows(csv) {
  if (!csv) return [];
  const rows = csv.trim().split(/\r?\n/);
  const headers = rows.shift()?.split(',') || [];
  return rows.map(row => {
    const cols = row.split(',');
    return headers.reduce((acc, header, index) => {
      acc[header.trim()] = (cols[index] || '').trim();
      return acc;
    }, {});
  });
}

async function fetchAlphaQuote(symbol) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key || !symbol) return null;

  const params = new URLSearchParams({
    function: 'GLOBAL_QUOTE',
    symbol,
    apikey: key,
  });
  const data = await fetchJson(`${ALPHA_VANTAGE_URL}?${params.toString()}`);
  const quote = data?.['Global Quote'];
  const price = Number(quote?.['05. price']);
  const changePercent = Number(String(quote?.['10. change percent'] || '').replace('%', ''));
  if (!Number.isFinite(price) || price <= 0) return null;

  return {
    price,
    change24h: Number.isFinite(changePercent) ? changePercent : null,
    updatedAt: new Date(),
  };
}

async function fetchAlphaCryptoQuote(symbol) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key || !symbol) return null;

  const params = new URLSearchParams({
    function: 'CURRENCY_EXCHANGE_RATE',
    from_currency: symbol,
    to_currency: 'USD',
    apikey: key,
  });
  const data = await fetchJson(`${ALPHA_VANTAGE_URL}?${params.toString()}`);
  const quote = data?.['Realtime Currency Exchange Rate'];
  const price = Number(quote?.['5. Exchange Rate']);
  if (!Number.isFinite(price) || price <= 0) return null;

  return {
    price,
    change24h: null,
    updatedAt: quote?.['6. Last Refreshed'] ? new Date(quote['6. Last Refreshed']) : new Date(),
  };
}

async function fetchAlphaListingSymbols(limit = 1000) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    function: 'LISTING_STATUS',
    state: 'active',
    apikey: key,
  });
  const csv = await fetchText(`${ALPHA_VANTAGE_URL}?${params.toString()}`);
  return parseCsvRows(csv)
    .filter(row => row.symbol && row.name && row.assetType === 'Stock')
    .filter(row => /^[A-Z][A-Z0-9.-]{0,8}$/.test(row.symbol))
    .slice(0, limit)
    .map(row => ({
      symbol: row.symbol,
      name: row.name,
      exchange: row.exchange || '',
    }));
}

async function fetchAlphaDigitalCurrencies(limit = 100) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    function: 'DIGITAL_CURRENCY_LIST',
    apikey: key,
  });
  const csv = await fetchText(`${ALPHA_VANTAGE_URL}?${params.toString()}`);
  return parseCsvRows(csv)
    .filter(row => row.currency_code && row.currency_name)
    .filter(row => /^[A-Z0-9]{2,12}$/.test(row.currency_code))
    .slice(0, limit)
    .map(row => ({
      symbol: row.currency_code,
      name: row.currency_name,
    }));
}

module.exports = {
  fetchAlphaQuote,
  fetchAlphaCryptoQuote,
  fetchAlphaListingSymbols,
  fetchAlphaDigitalCurrencies,
};
