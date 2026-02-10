// API Configuration - Évalué au runtime
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Côté client (navigateur) - utilise le port exposé par Docker
    return 'http://localhost:4000';
  }
  // Côté serveur (SSR) - utilise le nom du service Docker
  return 'http://backend:4000';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = {
  market: {
    overview: () => `${getApiBaseUrl()}/api/market/overview`,
    heatmap: () => `${getApiBaseUrl()}/api/market/heatmap`,
    quotes: () => `${getApiBaseUrl()}/api/market/quotes`,
    stock: (symbol: string) => `${getApiBaseUrl()}/api/market/details/${symbol}`,
    details: (symbol: string) => `${getApiBaseUrl()}/api/market/details/${symbol}`,
    historical: (symbol: string, period?: string) => 
      `${getApiBaseUrl()}/api/market/historical/${symbol}${period ? `?period=${period}` : ''}`,
    logo: (symbol: string) => `${getApiBaseUrl()}/api/market/logo/${symbol}`,
  },
  admin: {
    users: () => `${getApiBaseUrl()}/admin/users`,
    userStats: (userId: number) => `${getApiBaseUrl()}/admin/users/${userId}/stats`,
    updateUser: (userId: number) => `${getApiBaseUrl()}/users/${userId}/admin-status`,
  },
  users: {
    trackLogin: (userId: number) => `${getApiBaseUrl()}/users/${userId}/login`,
    addWatchlist: (userId: number) => `${getApiBaseUrl()}/users/${userId}/watchlist`,
    removeWatchlist: (userId: number, symbol: string) => `${getApiBaseUrl()}/users/${userId}/watchlist/${symbol}`,
    trackPrediction: (userId: number) => `${getApiBaseUrl()}/users/${userId}/predictions`,
  },
};
