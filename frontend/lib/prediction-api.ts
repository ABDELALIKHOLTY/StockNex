// API Configuration for Stock Prediction

// Python AI API Configuration - Évalué au runtime
const getPredictionApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Côté client - utilise le port exposé
    return 'http://localhost:8000';
  }
  // Côté serveur - utilise le nom du service Docker
  return 'http://prediction-api:8000';
};

export const PREDICTION_API_CONFIG = {
  // Base URL for Python FastAPI server
  baseUrl: getPredictionApiBaseUrl(),
  
  // Endpoints
  endpoints: {
    train: '/api/train',
    predict: '/api/predict',
    models: '/api/models',
    companies: '/api/companies',
    health: '/api/health',
  },

  // Timeout for requests (in milliseconds)
  timeout: 300000, // 5 minutes for training requests
  
  // Training parameters
  training: {
    defaultNTrials: 20,
    defaultLookbackPeriod: '50mo',
    defaultDaysAhead: 10,
    maxDaysAhead: 30,
    minDaysAhead: 1,
  },

  // Supported lookback periods
  lookbackPeriods: [
    { value: '10mo', label: '10 months' },
    { value: '25mo', label: '25 months' },
    { value: '50mo', label: '50 months (Recommended)' },
    { value: '100mo', label: '100 months' },
  ],
};

// S&P 500 Companies (Popular ones)
export const SP500_SECTORS = {
  Technology: ['MSFT', 'AAPL', 'NVDA', 'GOOGL', 'AMZN', 'META', 'INTC', 'AMD', 'QCOM', 'ADBE', 'CSCO', 'PYPL', 'SQ', 'CRM'],
  Finance: ['JPM', 'WFC', 'BLK', 'SCHW', 'COIN', 'V', 'MA', 'AXP'],
  Healthcare: ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMDX', 'LLY', 'MRK', 'GILD'],
  Industrials: ['BA', 'CAT', 'MMM', 'HON', 'GE', 'DE', 'ITT'],
  Consumer: ['TSLA', 'COST', 'WMT', 'MCD', 'NKE', 'HD', 'LOW', 'TJX'],
  Energy: ['XOM', 'CVX', 'COP', 'MPC', 'PSX'],
  Utilities: ['NEE', 'DUK', 'SO', 'D', 'EXC'],
  Real_Estate: ['PLD', 'DLR', 'CCI', 'EQIX', 'SPG'],
};

// Flatten sectors into a single list
export const ALL_SP500_COMPANIES = Object.values(SP500_SECTORS)
  .flat()
  .sort();

// Helper function to get full URL for an endpoint
export function getPredictionApiUrl(endpoint: keyof typeof PREDICTION_API_CONFIG.endpoints): string {
  // Toujours utiliser localhost:8000 pour que le navigateur puisse accéder
  const baseUrl = 'http://localhost:8000';
  return `${baseUrl}${PREDICTION_API_CONFIG.endpoints[endpoint]}`;
}

// Helper function to check if API is available
export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(getPredictionApiUrl('health'), {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

// Helper function to train a model
export async function trainModel(
  company: string,
  lookbackPeriod: string = '50mo',
  daysAhead: number = 10,
  nTrials: number = 20
) {
  const response = await fetch(getPredictionApiUrl('train'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      company,
      lookback_period: lookbackPeriod,
      days_ahead: daysAhead,
      n_trials: nTrials,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Training failed: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to get predictions
export async function getPredictions(company: string, daysAhead: number = 10) {
  const response = await fetch(getPredictionApiUrl('predict'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      company,
      days_ahead: daysAhead,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Prediction failed: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to get company models
export async function getCompanyModels(company: string) {
  const response = await fetch(`${getPredictionApiUrl('models')}/${company}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed to fetch models: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to delete company models
export async function deleteCompanyModels(company: string) {
  const response = await fetch(`${getPredictionApiUrl('models')}/${company}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Delete failed: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to list all companies with models
export async function getAllCompaniesWithModels() {
  const response = await fetch(getPredictionApiUrl('companies'));

  if (!response.ok) {
    throw new Error('Failed to fetch companies list');
  }

  return response.json();
}
