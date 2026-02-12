/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useCallback } from 'react';
import '@/styles/marketnews.css';

interface NewsItem {
  symbol: string;
  ticker?: string;
  title: string;
  summary?: string;
  link?: string;
  published?: string;
  time_published?: string;
  source?: string;
  overall_sentiment_score?: string;
  authors?: string[];
  publisher?: string;
}

interface MarketNewsProps {
  className?: string;
}

// CACHE MANAGEMENT
const CACHE_KEY = 'market_news_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes - refresh plus souvent
const CACHE_SOFT_EXPIRE = 3 * 60 * 1000; // 3 minutes - afficher staleness warning
const CACHE_REFRESH_INTERVAL = 8 * 60 * 1000; // 8 minutes - auto-refresh

interface CacheData {
  news: NewsItem[];
  timestamp: number;
  isStale?: boolean;
}

const getCachedNews = (): { data: CacheData | null; isStale: boolean } => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return { data: null, isStale: false };
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    const age = now - data.timestamp;
    
    // Toujours retourner le cache s'il existe (même expiré)
    // mais marquer s'il est "stale"
    const isStale = age > CACHE_SOFT_EXPIRE;
    
    return { 
      data: {
        ...data,
        isStale: isStale
      }, 
      isStale: age > CACHE_TTL 
    };
  } catch (error) {
    console.error('Error reading news cache:', error);
    return { data: null, isStale: false };
  }
};

const setCachedNews = (news: NewsItem[]) => {
  try {
    const data: CacheData = {
      news,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving news cache:', error);
  }
};

// API Yahoo RSS pour les news - VERSION AMÉLIORÉE
const getYahooRSSNews = async (symbols: string[], limitPerSymbol: number = 3): Promise<NewsItem[]> => {
  const allNews: Map<string, NewsItem> = new Map(); // Utiliser une Map pour éviter les doublons
  const seenTitles = new Set<string>(); // Tracker les titres qu'on a déjà vu
  
  for (const symbol of symbols.slice(0, 10)) {
    try {
      const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      const news = parseRSSResponse(text, limitPerSymbol, symbol);
      
      // Ajouter à la Map avec le LIEN comme clé, et vérifier que le titre est unique
      news.forEach(item => {
        const titleNormalized = item.title.toLowerCase().trim();
        const key = item.link || item.title;
        
        // Si on n'a pas vu ce titre et cette URL avant, l'ajouter
        if (!seenTitles.has(titleNormalized) && !allNews.has(key)) {
          seenTitles.add(titleNormalized);
          allNews.set(key, item);
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Erreur RSS pour ${symbol}:`, error);
    }
  }
  
  // Convertir Map en array et trier par date
  const newsArray = Array.from(allNews.values());
  newsArray.sort((a, b) => {
    const dateA = new Date(a.published || '').getTime();
    const dateB = new Date(b.published || '').getTime();
    return dateB - dateA;
  });
  
  return newsArray.slice(0, 12);
};

const parseRSSResponse = (rssText: string, limit: number, requestedSymbol: string): NewsItem[] => {
  const news: NewsItem[] = [];
  
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, "text/xml");
    const items = xmlDoc.getElementsByTagName("item");
    
    // Liste blanche des symboles valides
    const validSymbols = new Set([
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA',
      'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'DIS', 'XOM'
    ]);
    
    let addedCount = 0;
    for (let i = 0; i < items.length && addedCount < limit; i++) {
      const item = items[i];
      const title = item.getElementsByTagName("title")[0]?.textContent || 'No Title';
      const description = item.getElementsByTagName("description")[0]?.textContent || '';
      const link = item.getElementsByTagName("link")[0]?.textContent || '#';
      const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent || '';
      
      // Vérification stricte: extraire le symbol de l'URL
      let actualSymbol = requestedSymbol;
      
      try {
        // Yahoo URL format: /news/...?s=SYMBOL...
        const urlMatch = link.match(/[?&]s=([A-Z]+)(?:[&$]|$)/);
        if (urlMatch && urlMatch[1]) {
          actualSymbol = urlMatch[1];
        }
      } catch (e) {
        console.error('Erreur parsing URL:', e);
      }
      
      // Rejeter si le symbol ne correspond pas au requested
      if (actualSymbol !== requestedSymbol) {
        continue;
      }
      
      // Rejeter si ce n'est pas une URL Yahoo Finance valide
      if (!link.includes('finance.yahoo.com')) {
        continue;
      }
      
      news.push({
        symbol: actualSymbol,
        ticker: actualSymbol,
        title,
        summary: description.replace(/<[^>]*>/g, '').substring(0, 150),
        link,
        published: pubDate,
        publisher: 'Yahoo Finance',
        source: 'Yahoo Finance'
      });
      
      addedCount++;
    }
  } catch (error) {
    console.error('Erreur parsing RSS:', error);
  }
  
  return news;
};

// Symboles des principales entreprises pour les news
const MAJOR_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 
  'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'DIS'
];


// API Alpha Vantage supprimée - UTILISER SEULEMENT YAHOO FINANCE

const MarketNews = ({ className }: MarketNewsProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Récupérer les logos avec gestion d'erreur et fallback
  const fetchLogos = useCallback(async (symbols: string[]) => {
    const logosData: Record<string, string> = {};
    
    // Liste de sources de logos en ordre de préférence
    const logoSources = [
      (symbol: string) => `https://financialmodelingprep.com/image-stock/${symbol.toUpperCase()}.png`,
      (symbol: string) => `https://logo.clearbit.com/${getCompanyDomain(symbol)}.com`,
      (symbol: string) => `https://cdn.jsdelivr.net/npm/stock-symbols@1.0.0/images/${symbol.toUpperCase()}.svg`
    ];
    
    for (const symbol of symbols) {
      let found = false;
      
      for (const logoSource of logoSources) {
        try {
          const logoUrl = logoSource(symbol);
          // Essayer de charger l'image pour vérifier qu'elle existe
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = logoUrl;
          });
          logosData[symbol] = logoUrl;
          found = true;
          break;
        } catch {
          // Continuer avec la prochaine source
        }
      }

      // Si aucune source n'a fonctionné, laisser vide (affichera le placeholder)
      if (!found) {
        logosData[symbol] = '';
      }
    }
    
    setLogos(logosData);
  }, []);  // Récupérer les données de news avec cache
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache d'abord
      const { data: cached, isStale: hardExpired } = getCachedNews();
      if (cached && !hardExpired) {
        console.log('Using cached news data');
        setNews(cached.news);
        setIsStale(cached.isStale || false);
        const uniqueSymbols = [...new Set(cached.news.map(item => item.ticker).filter(Boolean))];
        await fetchLogos(uniqueSymbols as string[]);
        setLastRefresh(cached.timestamp);
        setLoading(false);
        return;
      }
      
      // Essayer de récupérer les nouvelles données
      const newsData = await getYahooRSSNews(MAJOR_SYMBOLS, 3);
      
      // Si on a rien reçu mais qu'on a du cache (même expiré), l'utiliser
      if (newsData.length === 0 && cached) {
        console.log('Using stale cache because fetch failed');
        setNews(cached.news);
        setIsStale(true);
        setError('News service unavailable - showing cached data');
        const uniqueSymbols = [...new Set(cached.news.map(item => item.ticker).filter(Boolean))];
        await fetchLogos(uniqueSymbols as string[]);
        setLastRefresh(cached.timestamp);
        setLoading(false);
        return;
      }
      
      // Sauvegarder les nouvelles données en cache
      if (newsData.length > 0) {
        setCachedNews(newsData);
        setNews(newsData);
        setIsStale(false);
        setLastRefresh(Date.now());
        
        // Récupérer les logos des symboles uniques
        const uniqueSymbols = [...new Set(newsData.map(item => item.ticker).filter(Boolean))];
        await fetchLogos(uniqueSymbols as string[]);
      }
      
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('News temporarily unavailable');
      
      // Fallback: utiliser n'importe quel cache disponible
      const { data: staleCache } = getCachedNews();
      if (staleCache && staleCache.news.length > 0) {
        setNews(staleCache.news);
        setIsStale(true);
        const uniqueSymbols = [...new Set(staleCache.news.map(item => item.ticker).filter(Boolean))];
        await fetchLogos(uniqueSymbols as string[]);
        setLastRefresh(staleCache.timestamp);
      } else {
        setNews([]);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchLogos]);

  useEffect(() => {
    fetchNews();
    
    // Auto-refresh les news toutes les 8 minutes
    const interval = setInterval(fetchNews, CACHE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Fonction helper pour obtenir le domaine de l'entreprise
  const getCompanyDomain = (symbol: string): string => {
    const domains: Record<string, string> = {
      'AAPL': 'apple',
      'MSFT': 'microsoft',
      'GOOGL': 'google',
      'AMZN': 'amazon',
      'TSLA': 'tesla',
      'META': 'meta',
      'NVDA': 'nvidia',
      'JPM': 'jpmorganchase',
      'JNJ': 'jnj',
      'V': 'visa',
      'PG': 'pg',
      'UNH': 'unitedhealthgroup',
      'HD': 'homedepot',
      'DIS': 'disney',
      'XOM': 'exxonmobil'
    };
    return domains[symbol] || symbol.toLowerCase();
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleNewsClick = (link: string) => {
    if (link && link !== '#') {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`w-full h-full bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-2xl text-gray-100">Market News</h3>
        <div className="flex items-center gap-3">
          {isStale && !loading && (
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
              Cached {Math.round((Date.now() - lastRefresh) / 60000)}m ago
            </span>
          )}
          {error && (
            <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
              {error}
            </span>
          )}
          <button
            onClick={() => fetchNews()}
            disabled={loading}
            className="text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh news"
          >
            {loading ? '⟳' : '↻'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {news.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all cursor-pointer border-l-2 border-cyan-500/50 hover:border-cyan-400 group"
              onClick={() => handleNewsClick(item.link || '#')}
            >
              <div className="flex items-start gap-3">
                {/* Contenu - SANS LOGO NI TICKER */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-100 line-clamp-2 flex-1 text-sm mb-2">
                    {item.title}
                  </h4>
                  
                  {item.summary && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span>📅 {formatTime(item.published || item.time_published || '')}</span>
                    {item.source && <span className="text-gray-600">•</span>}
                    {item.source && <span className="truncate">{item.source}</span>}
                  </div>
                </div>

                {/* Lien externe */}
                <span className="text-gray-400 shrink-0 group-hover:text-cyan-400 transition-colors flex-none">
                  ↗
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && news.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <div className="text-4xl mb-2">📰</div>
          <p>No news available at the moment</p>
          <p className="text-sm mt-2">
            <button 
              onClick={() => fetchNews()}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Try refreshing
            </button>
          </p>
        </div>
      )}

      {/* Footer avec info sur la source et refresh time */}
     
    </div>
  );
};

export default MarketNews;