'use client';

import MarketOverview from "@/components/market/MarketOverview";
import StockHeatmap from "@/components/market/StockHeatmap";
import MarketNews from "@/components/market/MarketNews";
import MarketQuotes from "@/components/market/MarketQuotes";

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen h-auto gap-8 p-8 bg-gradient-to-b from-slate-950 to-slate-900">
          {/* Top Row: Market Overview + Stock Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-[600px] min-w-0">
              <MarketOverview className="h-full" />
            </div>
            <div className="lg:col-span-2 h-[600px] min-w-0">
              <StockHeatmap className="h-full" />
            </div>
          </div>
          
          {/* Bottom Row: Market News + Market Quotes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-[600px] min-w-0">
              <MarketNews className="h-full" />
            </div>
            <div className="lg:col-span-2 h-[600px] min-w-0">
              <MarketQuotes className="h-full" />
            </div>
          </div>
        </div>
    )
}

export default Home;
