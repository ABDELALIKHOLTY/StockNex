/**
 * Symbol Utilities - Helper functions for stock symbols
 * Used by both frontend and backend
 */

import { 
  SP500_SYMBOLS_UNIQUE, 
  SYMBOL_TO_SECTOR, 
  SECTORS 
} from '../data/sp500-symbols';

/**
 * Get sector for a symbol
 */
export function getSectorForSymbol(symbol: string): string | undefined {
  return SYMBOL_TO_SECTOR[symbol];
}

/**
 * Get all companies in a sector
 */
export function getCompaniesBySector(sector: string): string[] {
  return Object.entries(SYMBOL_TO_SECTOR)
    .filter(([, s]) => s === sector)
    .map(([symbol]) => symbol)
    .sort();
}

/**
 * Check if symbol is valid S&P 500
 */
export function isValidSymbol(symbol: string): boolean {
  return SP500_SYMBOLS_UNIQUE.includes(symbol);
}

/**
 * Get all sectors
 */
export function getAllSectors(): string[] {
  return SECTORS;
}

/**
 * Group symbols by sector
 */
export function groupSymbolsBySector(): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  for (const sector of SECTORS) {
    grouped[sector] = getCompaniesBySector(sector);
  }
  
  return grouped;
}

/**
 * Search symbols by partial match
 */
export function searchSymbols(query: string): string[] {
  const upperQuery = query.toUpperCase();
  return SP500_SYMBOLS_UNIQUE.filter(symbol => 
    symbol.includes(upperQuery)
  ).sort();
}

/**
 * Get random symbols for dashboard
 */
export function getRandomSymbols(count: number = 10): string[] {
  const shuffled = [...SP500_SYMBOLS_UNIQUE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, SP500_SYMBOLS_UNIQUE.length));
}

/**
 * Get symbols by multiple sectors
 */
export function getSymbolsBySectors(sectors: string[]): string[] {
  return Object.entries(SYMBOL_TO_SECTOR)
    .filter(([, sector]) => sectors.includes(sector))
    .map(([symbol]) => symbol)
    .sort();
}
