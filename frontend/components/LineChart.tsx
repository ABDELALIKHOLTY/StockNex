import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart as RechartsLineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, Cell } from "recharts";
import { CandlestickData } from "@/types/trading";

interface LineChartProps {
  data: CandlestickData[];
  symbol: string
  title: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CandlestickData }> }) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    const isPositive = data.close >= data.open;
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-2">{data.date}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-6">
            <span className="text-muted-foreground">Prix:</span>
            <span className={`font-mono font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {data.close.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-muted-foreground">Volume:</span>
            <span className="font-mono text-foreground">{(data.volume / 1000000).toFixed(2)}M</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const LineChart = ({ data, symbol, title }: LineChartProps) => {
  const currentData = data[data.length - 1];
  const previousData = data[data.length - 2];
  
  const change = currentData.close - previousData.close;
  const changePercent = ((change / previousData.close) * 100);
  const isPositive = change >= 0;

  // Couleur dynamique basée sur la performance
  const lineColor = isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)";
  const gradientColor = isPositive ? "142, 76%, 36%" : "0, 84%, 60%";

  return (
    <Card className="w-full border-border">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-foreground">{title}</CardTitle>
          <span className="text-sm text-muted-foreground">{symbol}</span>
        </div>
        
        {/* Prix et variation */}
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-foreground">
            {currentData.close.toFixed(2)}
          </span>
          <span className={`text-lg font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%)
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Volume <span className="font-mono font-medium text-foreground">{(currentData.volume / 1000000).toFixed(2)}M</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Graphique Principal - Ligne */}
        <div className="px-6 pb-4">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`hsl(${gradientColor})`} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={`hsl(${gradientColor})`} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.2}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                orientation="right"
                tickFormatter={(value) => value.toFixed(2)}
                dx={10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: "5 5" }} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={lineColor}
                strokeWidth={2.5}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ r: 6, fill: lineColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique Volume */}
        <div className="px-6 pb-6 border-t border-border pt-4">
          <div className="text-xs text-muted-foreground mb-2 ml-2">Volume</div>
          <ResponsiveContainer width="100%" height={100}>
            <ComposedChart data={data}>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                hide
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                orientation="right"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                dx={10}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded px-2 py-1 text-xs">
                        <span className="font-mono">{(data.volume / 1000000).toFixed(2)}M</span>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
              />
              <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="hsl(var(--primary))"
                    opacity={0.3}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
