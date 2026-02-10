'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { api } from '@/lib/api';
import { Stock, HierarchicalData } from '@/types/heatmap';
import { SYMBOL_TO_SECTOR } from '@shared/data/sp500-symbols';

// ============================================
// SECTOR SIZE MULTIPLIERS - Used to balance visualization
// These help distribute space fairly across sectors for better visibility
// ============================================
// Sector multipliers no longer needed - using two-level normalization instead

// ============================================
// VALUE COMPRESSION - No longer needed, using direct market cap values
// ============================================

const getCompanyLogoUrl = (ticker: string): string => {
  return `https://financialmodelingprep.com/image-stock/${ticker.toUpperCase()}.png`;
};

interface StockHeatmapProps {
  className?: string;
}

interface ApiStockData {
  symbol?: string;
  ticker?: string;
  name?: string;
  companyName?: string;
  logoUrl?: string;
  logo?: string;
  marketCap?: number;
  volume?: number;
  changePercent?: number;
  change?: number;
  price?: number;
  sector?: string;
}

const normalizeSector = (sector?: string, symbol?: string, companyName?: string): string => {
  if (symbol && SYMBOL_TO_SECTOR[symbol]) {
    return SYMBOL_TO_SECTOR[symbol];
  }

  if (!sector && companyName) {
    const name = companyName.toLowerCase();
    if (name.includes('bank') || name.includes('financial') || name.includes('capital') ||
      name.includes('insurance') || name.includes('credit') || name.includes('payment') ||
      name.includes('investment') || name.includes('trust') || name.includes('holdings') ||
      name.includes('finance') || name.includes('asset') || name.includes('wealth')) {
      return 'Finance';
    }
    if (name.includes('tech') || name.includes('software') || name.includes('digital') ||
      name.includes('cloud') || name.includes('data') || name.includes('network') ||
      name.includes('system') || name.includes('computer') || name.includes('electronic') ||
      name.includes('internet') || name.includes('platform') || name.includes('app') ||
      name.includes('semiconductor') || name.includes('chip') || name.includes('processor')) {
      return 'Electronic Technology';
    }
    if (name.includes('health') || name.includes('medical') || name.includes('pharma') ||
      name.includes('biotech') || name.includes('drug') || name.includes('hospital') ||
      name.includes('care') || name.includes('therapy') || name.includes('diagnostic') ||
      name.includes('biomedical') || name.includes('pharmaceutical')) {
      return 'Health Technology';
    }
    if (name.includes('retail') || name.includes('store') || name.includes('shop') ||
      name.includes('market') || name.includes('supermarket') || name.includes('grocery') ||
      name.includes('discount') || name.includes('outlet') || name.includes('mall')) {
      return 'Retail Trade';
    }
    if (name.includes('manufacturing') || name.includes('industrial') ||
      name.includes('machinery') || name.includes('equipment') || name.includes('automation') ||
      name.includes('aerospace') || name.includes('defense') || name.includes('transportation') ||
      name.includes('automotive') || name.includes('vehicle')) {
      return 'Producer Manufacturing';
    }
    if (name.includes('energy') || name.includes('oil') || name.includes('gas') ||
      name.includes('petroleum') || name.includes('refining') || name.includes('drilling') ||
      name.includes('exploration') || name.includes('pipeline') || name.includes('crude')) {
      return 'Energy Minerals';
    }
    if (name.includes('utility') || name.includes('electric') || name.includes('power') ||
      name.includes('energy') && (name.includes('renewable') || name.includes('solar') || name.includes('wind'))) {
      return 'Utilities';
    }
    if (name.includes('real estate') || name.includes('reit') || name.includes('property') ||
      name.includes('realty') || name.includes('properties')) {
      return 'Real Estate Investment Trusts';
    }
    if (name.includes('telecom') || name.includes('communication') || name.includes('wireless') ||
      name.includes('broadband') || name.includes('cable') || name.includes('media')) {
      return 'Telecommunications';
    }
    if (name.includes('consumer') || name.includes('food') || name.includes('beverage') ||
      name.includes('packaged') || name.includes('household') || name.includes('procter') ||
      name.includes('coca') || name.includes('pepsi')) {
      return 'Consumer Non-Durables';
    }
    if (name.includes('chemical') || name.includes('material') || name.includes('mining') ||
      name.includes('steel') || name.includes('metal') || name.includes('aluminum') ||
      name.includes('copper') || name.includes('mineral')) {
      return 'Process Industries';
    }
    return 'Other';
  }

  if (sector) {
    const sectorLower = sector.toLowerCase();
    if (sectorLower.includes('technology') || sectorLower.includes('tech') || sectorLower.includes('electronic')) {
      return 'Electronic Technology';
    }
    if (sectorLower.includes('financial') || sectorLower.includes('finance') || sectorLower.includes('bank')) {
      return 'Finance';
    }
    if (sectorLower.includes('health') || sectorLower.includes('medical') || sectorLower.includes('pharma')) {
      return 'Health Technology';
    }
    if (sectorLower.includes('retail') || sectorLower.includes('consumer discretionary')) {
      return 'Retail Trade';
    }
    if (sectorLower.includes('consumer staples') || sectorLower.includes('consumer goods')) {
      return 'Consumer Non-Durables';
    }
    if (sectorLower.includes('industrial') || sectorLower.includes('manufacturing')) {
      return 'Producer Manufacturing';
    }
    if (sectorLower.includes('energy')) {
      return 'Energy Minerals';
    }
    if (sectorLower.includes('utility')) {
      return 'Utilities';
    }
    if (sectorLower.includes('real estate')) {
      return 'Real Estate Investment Trusts';
    }
    if (sectorLower.includes('communication') || sectorLower.includes('telecom')) {
      return 'Telecommunications';
    }
    if (sectorLower.includes('material') || sectorLower.includes('chemical')) {
      return 'Process Industries';
    }
  }
  return 'Other';
};

const getColor = (changePercent: number): string => {
  const rounded = Math.round(changePercent * 100) / 100;
  const absPercent = Math.abs(rounded);
  const neutralThreshold = 0.01;

  if (absPercent < neutralThreshold) {
    return 'rgb(201, 201, 201)';
  }

  if (rounded > 0) {
    if (absPercent >= 2.5) return 'rgb(5, 102, 54)';
    if (absPercent >= 1.5) return 'rgb(8, 153, 80)';
    if (absPercent >= 0.5) return 'rgb(66, 189, 127)';
    return 'rgb(66, 189, 127)';
  } else {
    if (absPercent >= 2.5) return 'rgb(153, 31, 41)';
    if (absPercent >= 1.5) return 'rgb(242, 54, 69)';
    if (absPercent >= 0.5) return 'rgb(247, 124, 128)';
    return 'rgb(247, 124, 128)';
  }
};

const getTextColor = (changePercent: number): string => {
  const color = getColor(changePercent);
  if (color === 'rgb(201, 201, 201)') return '#ffffff';
  const rgb = color.match(/\d+/g);
  if (!rgb) return '#ffffff';
  const [r, g, b] = rgb.map(Number);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const transformToHierarchy = (stocks: Stock[]): HierarchicalData => {
  const sectorsMap = new Map<string, Stock[]>();

  stocks.forEach(stock => {
    const sector = normalizeSector(stock.sector, stock.ticker, stock.companyName);
    if (!sectorsMap.has(sector)) {
      sectorsMap.set(sector, []);
    }
    sectorsMap.get(sector)!.push(stock);
  });

  const MAX_COMPANIES_PER_SECTOR = 12;
  const EXCLUDED_SECTORS = ['Energy Minerals'];

  // Step 1: Calculate market cap for each sector and sort by size
  const sectorMarketCaps = Array.from(sectorsMap.entries())
    .filter(([sectorName]) => !EXCLUDED_SECTORS.includes(sectorName))
    .map(([sectorName, sectorStocks]) => {
      const totalMarketCap = sectorStocks.reduce((sum, stock) => 
        sum + (stock.marketCap || stock.volume || 0), 0
      );
      return { sectorName, sectorStocks, totalMarketCap };
    })
    .sort((a, b) => b.totalMarketCap - a.totalMarketCap); // Sort descending

  // Step 2: Calculate adjustment factors to bring sectors closer together
  const minMarketCap = sectorMarketCaps[sectorMarketCaps.length - 1]?.totalMarketCap || 1;
  
  // Compression power for SECTORS - balanced compression
  const sectorCompressionPower = 0.2; // 0.3 gives ~10x instead of 1000x difference

  // Step 3: Create sectors with adjusted values
  const sectors: HierarchicalData[] = sectorMarketCaps.map(({ sectorName, sectorStocks, totalMarketCap }) => {
    // Sort by market cap (descending) to get the top companies
    const sortedStocks = [...sectorStocks].sort((a, b) => 
      (b.marketCap || b.volume || 0) - (a.marketCap || a.volume || 0)
    );
    
    // For Level 1 (dashboard view): Show top 12 companies with normalized sizes within sector
    const topStocks = sortedStocks.slice(0, MAX_COMPANIES_PER_SECTOR);
    
    // Get min/max of top stocks for level 1 normalization
    const topStockCaps = topStocks.map(s => s.marketCap || s.volume || 1);
    const minTopStockCap = Math.min(...topStockCaps);
    const stockCompressionPower = 0.4; // Compress individual stocks so all are visible
    
    // Create stock nodes for Level 1 with NORMALIZED market cap
    const stocksDataLevel1: HierarchicalData[] = topStocks.map(stock => {
      const marketCap = stock.marketCap || stock.volume || 1;
      
      // Normalize stock value so small and large companies both visible
      const normalizedStockValue = Math.pow(marketCap / minTopStockCap, stockCompressionPower) * minTopStockCap;
      
      // Apply change-based size variation (±10% based on changePercent)
      const changePercent = stock.changePercent || 0;
      const changeMultiplier = 1 + (changePercent / 100) * 0.1;
      
      return {
        name: stock.ticker,
        value: normalizedStockValue * changeMultiplier,
        data: stock,
        type: 'stock' as const,
      };
    });
    
    // For Level 2 (drill-down view): Create ALL companies with normalized sizes
    const allStockCaps = sortedStocks.map(s => s.marketCap || s.volume || 1);
    const minAllStockCap = Math.min(...allStockCaps);
    
    const stocksDataLevel2: HierarchicalData[] = sortedStocks.map(stock => {
      const marketCap = stock.marketCap || stock.volume || 1;
      
      // Normalize stock value within sector
      const normalizedStockValue = Math.pow(marketCap / minAllStockCap, stockCompressionPower) * minAllStockCap;
      
      // Apply change-based size variation
      const changePercent = stock.changePercent || 0;
      const changeMultiplier = 1 + (changePercent / 100) * 0.1;
      
      return {
        name: stock.ticker,
        value: normalizedStockValue * changeMultiplier,
        data: stock,
        type: 'stock' as const,
      };
    });

    // Sector value = normalized market cap using power function
    const normalizedSectorValue = Math.pow(totalMarketCap / minMarketCap, sectorCompressionPower) * minMarketCap;

    return {
      name: sectorName,
      children: stocksDataLevel1,  // Level 1: Top 12 companies (normalized)
      value: normalizedSectorValue,
      data: { 
        name: sectorName, 
        stocks: sectorStocks,
        allStocksForDrill: stocksDataLevel2  // Store all stocks for drill-down (normalized)
      },
      type: 'sector' as const,
    };
  });

  return {
    name: 'root',
    children: sectors,
    value: sectors.reduce((sum, s) => sum + (s.value || 0), 0),
    type: 'root' as const,
  };
};

const StockHeatmap = ({ className }: StockHeatmapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<HierarchicalData | null>(null);
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const hierarchyRef = useRef<HierarchicalData | null>(null);
  const isDrilledDown = useRef(false);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(api.market.heatmap());
        if (response.ok) {
          const data = await response.json();
          const transformedStocks: Stock[] = data
            .filter((item: ApiStockData) => {
              const marketCap = item.marketCap || item.volume || 0;
              return marketCap > 0;
            })
            .map((item: ApiStockData) => {
              const ticker = item.symbol || item.ticker || '';
              return {
                ticker,
                companyName: item.name || item.companyName,
                logoUrl: getCompanyLogoUrl(ticker),
                marketCap: item.marketCap || item.volume || 1000000,
                changePercent: item.changePercent || item.change || 0,
                price: item.price || 0,
                volume: item.volume,
                sector: item.sector,
              };
            });

          console.log(`Loaded ${transformedStocks.length} stocks for heatmap`);
          setStocks(transformedStocks);
        }
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(api.market.heatmap());
        if (response.ok) {
          const data = await response.json();
          setStocks((prevStocks) =>
            prevStocks.map((stock) => {
              const updatedItem = data.find((item: ApiStockData) =>
                (item.symbol || item.ticker) === stock.ticker
              );
              if (updatedItem) {
                return {
                  ...stock,
                  changePercent: updatedItem.changePercent || updatedItem.change || 0,
                  price: updatedItem.price || stock.price,
                  volume: updatedItem.volume || stock.volume,
                };
              }
              return stock;
            })
          );
        }
      } catch (error) {
        console.error('Error updating stock data:', error);
      }
    }, 30000); // Refresh every 30 seconds (was 2000ms - too aggressive)
    
    return () => clearInterval(interval);
  }, []);

  const hierarchy = useMemo(() => {
    if (stocks.length === 0) return null;
    const h = transformToHierarchy(stocks);
    hierarchyRef.current = h;
    return h;
  }, [stocks]);

  useEffect(() => {
    if (hierarchy && !currentView) {
      setCurrentView(hierarchy);
    }
  }, [hierarchy, currentView]);

  const animationFrameRef = useRef<number | null>(null);

  // ========================================
  // DRILLDOWN HANDLER - SIMPLE CLICK
  // ========================================
  const handleDrillDown = useCallback((sectorData: HierarchicalData) => {
    // Get all stocks for drill-down from the data object
    const allStocksForDrill = (sectorData.data as unknown as Record<string, unknown>)?.allStocksForDrill as HierarchicalData[] | undefined;
    
    const newView: HierarchicalData = {
      name: sectorData.name,
      children: allStocksForDrill || sectorData.children || [],  // Use ALL stocks for level 2 display
      value: sectorData.value,
      type: 'sector',
      data: sectorData.data,
    };

    isDrilledDown.current = true;
    setCurrentView(newView);
  }, []);

  // ========================================
  // STOCK SELECTION HANDLER WITH ALERT
  // ========================================
  // STOCK SELECTION HANDLER - REDIRECT TO WATCHLIST
  // ========================================
  const handleStockSelect = useCallback((stock: Stock) => {
    // Redirect to watchlist page with the selected stock
    window.location.href = `/watchlist?symbol=${stock.ticker}`;
  }, []);

  // ========================================
  // FORMAT MARKET CAP FUNCTION
  // ========================================
  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  // ========================================
  // GET CHANGE COLOR FUNCTION
  // ========================================
  const getChangeColor = (changePercent: number): string => {
    if (changePercent > 0) return '#00ff00'; // Green
    if (changePercent < 0) return '#ff0000'; // Red
    return '#888888'; // Gray
  };

  // ========================================
  // MAIN DRAWING FUNCTION - NO ZOOM
  // ========================================
  const drawTreemap = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !currentView) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (!svgRef.current || !containerRef.current || !currentView) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const baseWidth = Math.floor(rect.width);
      const baseHeight = Math.floor(rect.height);

      console.log(`Container dimensions: ${baseWidth}x${baseHeight}`);

      if (svgRef.current) {
        svgRef.current.setAttribute('viewBox', `0 0 ${baseWidth} ${baseHeight}`);
      }

      const g = svg.append('g');

      if (!isDrilledDown.current) {
        // SECTOR VIEW - Display all sectors
        const root = d3.hierarchy(currentView)
          .sum(d => d.value || 0)
          .sort((a, b) => (b.value || 0) - (a.value || 0));

        const treemap = d3.treemap<HierarchicalData>()
          .size([baseWidth, baseHeight])
          .paddingTop(0)
          .paddingRight(0)
          .paddingBottom(0)
          .paddingLeft(0)
          .round(true)
          .tile(d3.treemapBinary);

        const treemapRoot = treemap(root);

        const sectorNodes = (treemapRoot.children || []) as d3.HierarchyRectangularNode<HierarchicalData>[];
        sectorNodes.forEach((sectorNode) => {
          const sectorData = sectorNode.data;
          const x0 = sectorNode.x0;
          const y0 = sectorNode.y0;
          const x1 = sectorNode.x1;
          const y1 = sectorNode.y1;
          const width = x1 - x0;
          const height = y1 - y0;

          if (width < 5 || height < 5) return;

          // Sector background with click handler for drill down
          const sectorRect = g.append('rect')
            .attr('x', x0)
            .attr('y', y0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'rgba(35, 35, 50, 0.95)')
            .attr('stroke', 'rgba(100, 150, 200, 0.4)')
            .attr('stroke-width', 1)
            .attr('class', 'sector-rect')
            .attr('data-sector', sectorData.name)
            .style('cursor', 'pointer')
            .style('pointer-events', 'all')
            .style('transition', 'opacity 0.3s ease, fill 0.3s ease');

          // Sector label
          if (width > 60 && height > 20) {
            g.append('text')
              .attr('x', x0 + 6)
              .attr('y', y0 + 16)
              .attr('fill', '#ffffff')
              .attr('font-size', Math.min(12, width / 15) + 'px')
              .attr('font-weight', 'bold')
              .text(sectorData.name);
          }

          // Companies in this sector
          const stocks = sectorData.children || [];
          if (stocks.length > 0 && width > 20 && height > 20) {
            const labelHeight = height > 30 ? 18 : 0;
            const availableHeight = height - labelHeight;
            const padding = 2;

            const sectorHierarchy = d3.hierarchy(sectorData)
              .sum(d => d.value || 0)
              .sort((a, b) => (b.value || 0) - (a.value || 0));

            const companyTreemap = d3.treemap<HierarchicalData>()
              .size([width - padding * 2, availableHeight - padding * 2])
              .padding(0)
              .round(true)
              .tile(d3.treemapBinary);

            const companyTreemapRoot = companyTreemap(sectorHierarchy);

            const companyNodes = (companyTreemapRoot.children || []) as d3.HierarchyRectangularNode<HierarchicalData>[];
            companyNodes.forEach((companyNode) => {
              const stock = companyNode.data.data as Stock;
              if (!stock) return;

              const compX0 = x0 + padding + companyNode.x0;
              const compY0 = y0 + labelHeight + padding + companyNode.y0;
              const compX1 = x0 + padding + companyNode.x1;
              const compY1 = y0 + labelHeight + padding + companyNode.y1;
              const compWidth = compX1 - compX0;
              const compHeight = compY1 - compY0;

              if (compWidth < 3 || compHeight < 3) return;

              const color = getColor(stock.changePercent);
              const textColor = getTextColor(stock.changePercent);

              const compGroup = g.append('g')
                .attr('class', 'company-cell')
                .attr('data-ticker', stock.ticker)
                .attr('data-sector', sectorData.name)
                .style('cursor', 'pointer')
                .style('pointer-events', 'all');

              // Company rectangle
              compGroup.append('rect')
                .attr('x', compX0)
                .attr('y', compY0)
                .attr('width', compWidth)
                .attr('height', compHeight)
                .attr('fill', color)
                .attr('stroke', 'rgba(0, 0, 0, 0.3)')
                .attr('stroke-width', 0.5)
                .style('transition', 'fill 0.4s ease, opacity 0.4s ease');

              // Logo and text - CENTERED with responsive sizing
              const MIN_BOX_SIZE = 16; // Minimum box size to show ticker (reduced from 20)
              
              if (compWidth > MIN_BOX_SIZE && compHeight > MIN_BOX_SIZE) {
                // Calculate responsive sizes based on box dimensions
                const boxArea = compWidth * compHeight;
                
                // Logo size adapts to box (8-24px depending on space)
                const logoSize = boxArea < 400 ? 8 : 
                                 boxArea < 600 ? 10 : 
                                 Math.max(8, Math.min(24, compWidth * 0.3, compHeight * 0.3));
                
                // Font sizes for small boxes
                const tickerFontSize = boxArea < 400 ? 6 : 
                                      boxArea < 600 ? 7 :
                                      Math.max(6, Math.min(10, compWidth / 6));
                
                const percentFontSize = boxArea < 400 ? 5 : 
                                       boxArea < 600 ? 5.5 :
                                       Math.max(5, Math.min(8, compWidth / 8));
                
                // Total content height
                const logoTopPadding = 1;
                const tickerTopPadding = 1;
                const percentTopPadding = 1;
                
                // Only show percent if box is tall enough
                const showPercent = compHeight > 40;
                const totalHeight = logoSize + logoTopPadding + tickerFontSize + tickerTopPadding + 
                                   (showPercent ? percentFontSize + percentTopPadding : 0);
                
                // Calculate starting Y to center vertically
                const startY = compY0 + Math.max(1, (compHeight - totalHeight) / 2);
                
                // Logo - centered
                let currentY = startY;
                if (stock.logoUrl && logoSize > 6) {
                  compGroup.append('image')
                    .attr('x', compX0 + (compWidth - logoSize) / 2)
                    .attr('y', currentY)
                    .attr('width', logoSize)
                    .attr('height', logoSize)
                    .attr('xlink:href', stock.logoUrl)
                    .attr('preserveAspectRatio', 'xMidYMid meet')
                    .style('pointer-events', 'none')
                    .on('error', function () {
                      d3.select(this).remove();
                      
                      // Fallback circle with first letter
                      if (logoSize > 6) {
                        compGroup.append('circle')
                          .attr('cx', compX0 + compWidth / 2)
                          .attr('cy', currentY + logoSize / 2)
                          .attr('r', logoSize / 2)
                          .attr('fill', '#4F46E5')
                          .style('pointer-events', 'none');
                        
                        compGroup.append('text')
                          .attr('x', compX0 + compWidth / 2)
                          .attr('y', currentY + logoSize / 2 + 2)
                          .attr('text-anchor', 'middle')
                          .attr('fill', 'white')
                          .attr('font-size', Math.max(5, logoSize * 0.6) + 'px')
                          .attr('font-weight', 'bold')
                          .text(stock.ticker?.[0] || '?')
                          .style('pointer-events', 'none');
                      }
                    });
                  currentY += logoSize + logoTopPadding;
                }
                
                // Ticker name - centered
                compGroup.append('text')
                  .attr('x', compX0 + compWidth / 2)
                  .attr('y', currentY)
                  .attr('text-anchor', 'middle')
                  .attr('dominant-baseline', 'hanging')
                  .attr('fill', textColor)
                  .attr('font-size', tickerFontSize + 'px')
                  .attr('font-weight', 'bold')
                  .text(stock.ticker);

                // Percentage - show if space available, centered
                if (compHeight > 45) {
                  currentY += tickerFontSize + tickerTopPadding;
                  compGroup.append('text')
                    .attr('x', compX0 + compWidth / 2)
                    .attr('y', currentY)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'hanging')
                    .attr('fill', textColor)
                    .attr('font-size', percentFontSize + 'px')
                    .text(`${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(1)}%`);
                }
              }

              // Event handlers for companies
              compGroup.on('mouseenter', function (event: MouseEvent) {
                d3.select(this).select('rect').attr('opacity', 0.75).attr('stroke-width', 1);
                // Only show tooltip on hover, not if already selected
                setHoveredStock(stock);
                setTooltipPosition({ x: event.clientX, y: event.clientY });
              })
              .on('mousemove', (event: MouseEvent) => {
                setTooltipPosition({ x: event.clientX, y: event.clientY });
              })
              .on('mouseleave', function () {
                d3.select(this).select('rect').attr('opacity', 1).attr('stroke-width', 0.5);
                // Always clear hovered stock on mouseleave, even if selected
                setHoveredStock(null);
              })
              .on('click', function (event: MouseEvent) {
                event.stopPropagation();
                handleStockSelect(stock);
              });
            });

            // Sector click handler for drill down
            sectorRect.on('click', (event: MouseEvent) => {
              event.stopPropagation();
              handleDrillDown(sectorData);
            })
            .on('mouseenter', function () {
              d3.select(this)
                .attr('fill', 'rgba(150, 200, 255, 0.1)')
                .attr('stroke', 'rgba(150, 200, 255, 0.6)')
                .attr('stroke-width', 2);
            })
            .on('mouseleave', function () {
              d3.select(this)
                .attr('fill', 'rgba(35, 35, 50, 0.95)')
                .attr('stroke', 'rgba(100, 150, 200, 0.4)')
                .attr('stroke-width', 1);
            });
          }
        });

      } else {
        // DRILL-DOWN VIEW - Display individual stocks
        const root = d3.hierarchy(currentView)
          .sum(d => {
            if (d.type === 'stock') {
              const stock = d.data as Stock;
              return stock.marketCap || stock.volume || 1;
            }
            return d.value || 0;
          })
          .sort((a, b) => (b.value || 0) - (a.value || 0));

        const treemap = d3.treemap<HierarchicalData>()
          .size([baseWidth, baseHeight])
          .paddingTop(0)
          .paddingRight(0)
          .paddingBottom(0)
          .paddingLeft(0)
          .round(true)
          .tile(d3.treemapBinary);

        const treemapRoot = treemap(root);

        const stockNodes = (treemapRoot.children || []) as d3.HierarchyRectangularNode<HierarchicalData>[];
        stockNodes.forEach((stockNode) => {
          const stock = stockNode.data.data as Stock;
          if (!stock) return;

          const x0 = stockNode.x0;
          const y0 = stockNode.y0;
          const x1 = stockNode.x1;
          const y1 = stockNode.y1;
          const width = x1 - x0;
          const height = y1 - y0;

          if (width < 5 || height < 5) return;

          const color = getColor(stock.changePercent);
          const textColor = getTextColor(stock.changePercent);

          const stockGroup = g.append('g')
            .attr('class', 'stock-block')
            .attr('data-ticker', stock.ticker)
            .style('cursor', 'pointer')
            .style('pointer-events', 'all');

          stockGroup.append('rect')
            .attr('x', x0)
            .attr('y', y0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', color)
            .attr('stroke', 'rgba(0, 0, 0, 0.25)')
            .attr('stroke-width', 0.5);

          // Logo and text
          let logoSize = 0;
          if (stock.logoUrl && width > 60 && height > 40) {
            logoSize = Math.min(24, width * 0.3, height * 0.35);
            
            stockGroup.append('image')
              .attr('x', x0 + (width - logoSize) / 2)
              .attr('y', y0 + (height - logoSize) / 2 - 16)
              .attr('width', logoSize)
              .attr('height', logoSize)
              .attr('xlink:href', stock.logoUrl)
              .attr('preserveAspectRatio', 'xMidYMid meet')
              .style('pointer-events', 'none')
              .on('error', function () {
                d3.select(this).remove();
                
                stockGroup.append('circle')
                  .attr('cx', x0 + width / 2)
                  .attr('cy', y0 + (height - logoSize) / 2 - 16 + logoSize / 2)
                  .attr('r', logoSize / 2)
                  .attr('fill', '#4F46E5')
                  .style('pointer-events', 'none');
                
                stockGroup.append('text')
                  .attr('x', x0 + width / 2)
                  .attr('y', y0 + (height - logoSize) / 2 - 16 + logoSize / 2 + 6)
                  .attr('text-anchor', 'middle')
                  .attr('fill', 'white')
                  .attr('font-size', Math.max(10, logoSize - 4) + 'px')
                  .attr('font-weight', 'bold')
                  .attr('font-family', 'Arial')
                  .text(stock.ticker.substring(0, 1))
                  .style('pointer-events', 'none');
              });
          }

          if (width > 30 && height > 20) {
            stockGroup.append('text')
              .attr('x', x0 + width / 2)
              .attr('y', y0 + height / 2 + 10)
              .attr('text-anchor', 'middle')
              .attr('fill', textColor)
              .attr('font-size', Math.min(14, width / 8) + 'px')
              .attr('font-weight', 'bold')
              .text(stock.ticker);

            if (height > 35) {
              stockGroup.append('text')
                .attr('x', x0 + width / 2)
                .attr('y', y0 + height / 2 + 22)
                .attr('text-anchor', 'middle')
                .attr('fill', textColor)
                .attr('font-size', Math.min(12, width / 10) + 'px')
                .text(`${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`);
            }
          }

          stockGroup.on('mouseenter', function (event: MouseEvent) {
            d3.select(this).select('rect').attr('opacity', 0.75).attr('stroke-width', 1.5);
            setHoveredStock(stock);
            setTooltipPosition({ x: event.clientX, y: event.clientY });
          });

          stockGroup.on('mousemove', (event: MouseEvent) => {
            setTooltipPosition({ x: event.clientX, y: event.clientY });
          });

          stockGroup.on('mouseleave', function () {
            d3.select(this).select('rect').attr('opacity', 1).attr('stroke-width', 0.5);
            setHoveredStock(null);
          });

          stockGroup.on('click', function (event: MouseEvent) {
            event.stopPropagation();
            handleStockSelect(stock);
          });
        });
      }
    });
  }, [currentView, handleDrillDown, handleStockSelect]);

  useEffect(() => {
    if (!loading && currentView) {
      drawTreemap();
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentView, loading, drawTreemap]);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        drawTreemap();
      }, 250);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [drawTreemap]);

  return (
    <div className={`w-full h-full bg-gray-800/30  border border-gray-700/50 rounded-lg flex flex-col relative ${className} pb-8`}>
      <div className="flex items-center justify-between px-2 pt-2 pb-1">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-2xl text-gray-100">Stock Heatmap</h3>
          {isDrilledDown.current && currentView && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <button
                onClick={() => {
                  if (hierarchyRef.current) {
                    setCurrentView(hierarchyRef.current);
                    isDrilledDown.current = false;
                  }
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← All Sectors
              </button>
              <span className="text-gray-500">|</span>
              <span className="font-medium">{currentView.name}</span>
            </div>
          )}
        </div>
        
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      ) : (
        <div className="w-full flex-1 min-h-0 flex flex-col relative px-2">
          <div
            ref={containerRef}
            className="w-full flex-1 min-h-0 overflow-hidden bg-gray-900/50 rounded-lg relative heatmap-container"
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              className="heatmap-svg"
              preserveAspectRatio="none"
            />
          </div>

          {/* Tooltip Stylisé comme dans la capture d'écran */}
          {hoveredStock && (
            <div
              className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-3 max-w-xs"
              style={{
                left: `${tooltipPosition.x + 15}px`,
                top: `${tooltipPosition.y - 10}px`,
                transform: 'translate(0, -50%)'
              }}
            >
              {/* Company Name */}
              <div className="font-bold text-white text-sm mb-2">
                {hoveredStock.companyName}
              </div>
              
              {/* Details Grid */}
              <div className="space-y-1">
                {/* Symbol */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Symbol:</span>
                  <span className="text-white text-xs font-medium">{hoveredStock.ticker}</span>
                </div>
                
                {/* Price */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Price:</span>
                  <span className="text-white text-xs font-medium">
                    ${hoveredStock.price.toFixed(2)}
                  </span>
                </div>
                
                {/* Change */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Change:</span>
                  <span 
                    className="text-xs font-medium"
                    style={{ 
                      color: getChangeColor(hoveredStock.changePercent) 
                    }}
                  >
                    {hoveredStock.changePercent >= 0 ? '+' : ''}{hoveredStock.changePercent.toFixed(2)}%
                  </span>
                </div>
                
                {/* Market Cap */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Market Cap:</span>
                  <span className="text-white text-xs font-medium">
                    {hoveredStock.marketCap ? formatMarketCap(hoveredStock.marketCap) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center gap-4 flex-wrap text-xs px-2 py-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm legend-color-1"></div>
          <span className="text-gray-300">−3%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm legend-color-2"></div>
          <span className="text-gray-300">−2%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm legend-color-3"></div>
          <span className="text-gray-300">−1%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm legend-color-4"></div>
          <span className="text-gray-300">0%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm legend-color-5"></div>
          <span className="text-gray-300">+1%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm legend-color-6"></div>
          <span className="text-gray-300">+2%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm legend-color-7"></div>
          <span className="text-gray-300">+3%</span>
        </div>
        <div className="text-gray-500 ml-4">Size = Market Cap</div>
      </div>
    </div>
  );
};

export default StockHeatmap;