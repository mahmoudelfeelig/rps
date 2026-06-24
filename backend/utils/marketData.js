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

module.exports = {
  fetchAlphaQuote,
  fetchAlphaCryptoQuote,
};
