# BitCorn • BTC Real‑Time Chart (Static, Netlify-ready)

Live Bitcoin candlestick chart using **Lightweight Charts** with **Binance** REST + WebSocket data.
Cream theme to match BitCorn brand. No backend required.

## ✨ Features
- Historical candles via REST (500 last bars)
- Live updates via WebSocket (`@kline_<interval>`)
- Interval switcher: 1m, 5m, 15m, 1h, 4h, 1d
- Responsive layout, cream background

## 📂 Project Structure
```
.
├─ public/index.html   # main page (serves chart)
├─ src/main.js         # chart + data wiring
├─ assets/theme.css    # minimal styling
└─ netlify.toml        # (optional) static deploy config
```

## 🚀 Run locally (any static server)
- Open `index.html` directly, **or**
- Use a tiny server:
  ```bash
  npx serve .
  # or
  python3 -m http.server 5173
  ```

## 🌐 Deploy to Netlify
1. Create a new repo on GitHub and push these files.
2. In Netlify, **New site from Git** → select the repo.
3. Build command: _none_ (static)  
   Publish directory: `.`
4. Deploy.

## 🔁 Switching data providers
This demo uses Binance’s public API (BTC/USDT). For USD-only sources (Coinbase/Kraken) you may need a small serverless proxy to avoid CORS. See comments inside `main.js` for pointers.

## ⚠️ Disclaimer
For demo/visualization only. Do not use for trading decisions.
