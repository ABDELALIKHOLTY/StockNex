'use client';

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  height?: number;
}

function TradingViewWidget({ symbol = 'NASDAQ:AAPL', height = 600 }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (!container.current) return;

      // Clear previous scripts
      container.current.innerHTML = '';

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": false,
          "hide_side_toolbar": true,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "hide_volume": false,
          "hotlist": false,
          "interval": "D",
          "locale": "en",
          "save_image": true,
          "style": "1",
          "symbol": "NASDAQ:${symbol}",
          "theme": "dark",
          "timezone": "Etc/UTC",
          "backgroundColor": "#0F0F0F",
          "gridColor": "rgba(242, 242, 242, 0.06)",
          "watchlist": [],
          "withdateranges": false,
          "compareSymbols": [],
          "studies": [],
          "autosize": true
        }`;
      container.current.appendChild(script);
    },
    [symbol]
  );

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: '100%', width: '100%' }}>
      <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
      <div className="tradingview-widget-copyright"><a href={`https://www.tradingview.com/symbols/${symbol}/`} rel="noopener nofollow" target="_blank"><span className="blue-text">{symbol} stock chart</span></a><span className="trademark"> by TradingView</span></div>
    </div>
  );
}

export default memo(TradingViewWidget);