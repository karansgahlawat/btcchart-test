// BitCorn BTC Real-Time Chart using Lightweight Charts + Binance
let container, chart, series, sel, ws;

// Binance API helpers
function binanceKlineUrl(symbol, interval, limit = 500) {
  return `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
}

function mapKlines(rows) {
  return rows.map(k => ({
    time: Math.floor(k[0] / 1000),
    open: +k[1], 
    high: +k[2], 
    low: +k[3], 
    close: +k[4]
  }));
}

// Load historical data
async function seed(interval) {
  try {
    ws = new WebSocket(`ws://localhost:5173/ws/ws/btcusdt@kline_${interval}`);
    const res = await fetch(url);
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      console.error('Unexpected response:', data);
      return;
    }
    
    const candleData = mapKlines(data);
    series.setData(candleData);
    console.log(`Loaded ${candleData.length} candles for ${interval}`);
  } catch (error) {
    console.error('Error loading historical data:', error);
  }
}

// WebSocket connection for live updates
function connectWS(interval) {
  if (ws) { 
    try { 
      ws.close(); 
    } catch(e) {
      console.log('Closed previous WebSocket connection');
    } 
  }
  
  const stream = `wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`;
  ws = new WebSocket(stream);
  
  ws.onopen = () => {
    console.log('WebSocket connected:', stream);
  };
  
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (!msg.k) return;
      
      const k = msg.k;
      const bar = { 
        time: Math.floor(k.t / 1000), 
        open: +k.o, 
        high: +k.h, 
        low: +k.l, 
        close: +k.c 
      };
      
      series.update(bar);
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };
  
  ws.onclose = () => {
    console.warn('WebSocket closed, retrying in 2s…');
    setTimeout(() => connectWS(interval), 2000);
  };
  
  ws.onerror = (e) => {
    console.error('WebSocket error:', e);
  };
}

// Handle chart resizing
async function initApp() {
  container = document.getElementById('chart');
  sel = document.getElementById('interval');
  
  if (!container || !sel) {
    console.error('Required DOM elements not found');
    return;
  }

  // Create chart with cream theme
  chart = LightweightCharts.createChart(container, {
    layout: { 
      background: { type: 'solid', color: '#FAF1E6' }, 
      textColor: '#3C2E20' 
    },
    rightPriceScale: { borderVisible: false },
    timeScale: { 
      timeVisible: true, 
      secondsVisible: false, 
      borderVisible: false 
    },
    grid: { 
      vertLines: { color: '#eae4da' }, 
      horzLines: { color: '#eae4da' } 
    },
  });

  series = chart.addCandlestickSeries({
    upColor: '#00a652', 
    downColor: '#d64b4b',
    borderVisible: false, 
    wickUpColor: '#00a652', 
    wickDownColor: '#d64b4b',
  });

  // Handle chart resizing
  function resize() {
    const rect = container.getBoundingClientRect();
    chart.applyOptions({ 
      width: rect.width, 
      height: rect.height 
    });
  }

  window.addEventListener('resize', resize);
  setTimeout(resize, 100);

  // Handle interval changes
  sel.addEventListener('change', async () => {
    const newInterval = sel.value;
    console.log('Switching to interval:', newInterval);
    await seed(newInterval);
    connectWS(newInterval);
  });

  // Start the application
  const currentInterval = sel.value;
  await seed(currentInterval);
  connectWS(currentInterval);
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initApp);