// BitCorn BTC Real-Time Chart using Lightweight Charts + Binance
const container = document.getElementById('chart');

// Create chart
const chart = LightweightCharts.createChart(container, {
  layout: { background: { type: 'solid', color: '#FAF1E6' }, textColor: '#3C2E20' },
  rightPriceScale: { borderVisible: false },
  timeScale: { timeVisible: true, secondsVisible: false, borderVisible: false },
  grid: { vertLines: { color: '#eae4da' }, horzLines: { color: '#eae4da' } },
});
const series = chart.addCandlestickSeries({
  upColor: '#00a652', downColor: '#d64b4b',
  borderVisible: false, wickUpColor: '#00a652', wickDownColor: '#d64b4b',
});

const sel = document.getElementById('interval');
let ws;

// Helpers
function binanceKlineUrl(symbol, interval, limit=500){
  return `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
}
function mapKlines(rows){
  return rows.map(k => ({
    time: Math.floor(k[0]/1000),
    open: +k[1], high: +k[2], low: +k[3], close: +k[4]
  }));
}

async function seed(interval){
  const url = binanceKlineUrl('BTCUSDT', interval, 500);
  const res = await fetch(url);
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error('Unexpected response:', data);
    return;
  }
  series.setData(mapKlines(data));
}

function connectWS(interval){
  if (ws) { try { ws.close(); } catch(e){} }
  const stream = `wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`;
  ws = new WebSocket(stream);
  ws.onopen = () => console.log('WS connected:', stream);
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (!msg.k) return;
    const k = msg.k;
    const bar = { time: Math.floor(k.t/1000), open:+k.o, high:+k.h, low:+k.l, close:+k.c };
    series.update(bar);
  };
  ws.onclose = () => {
    console.warn('WS closed, retrying in 2s…');
    setTimeout(()=>connectWS(interval), 2000);
  };
  ws.onerror = (e) => console.error('WS error:', e);
}

// Resize handling
function resize(){
  const rect = container.getBoundingClientRect();
  chart.applyOptions({ width: rect.width, height: rect.height });
}
window.addEventListener('resize', resize);
setTimeout(resize, 50);

// Init
await seed(sel.value);
connectWS(sel.value);

// Interval change
sel.addEventListener('change', async () => {
  await seed(sel.value);
  connectWS(sel.value);
});
