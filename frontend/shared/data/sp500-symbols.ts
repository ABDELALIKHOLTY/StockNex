/**
 * UNIFIED S&P 500 SYMBOLS AND SECTORS
 * Single source of truth for all stock data
 * Used by both frontend and backend
 */

// Complete list of S&P 500 symbols
export const SP500_SYMBOLS = [
  // Mega Cap Technology
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL',
  
  // Large Cap Technology
  'CRM', 'ADBE', 'AMD', 'CSCO', 'ACN', 'IBM', 'INTU', 'TXN', 'QCOM', 'AMAT',
  'MU', 'INTC', 'ADI', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MCHP', 'FTNT', 'ANSS',
  'ROP', 'FICO', 'MPWR', 'APH', 'ADSK', 'MSI', 'KEYS', 'ZBRA', 'GDDY', 'PTC',
  'TYL', 'TER', 'TRMB', 'VRSN', 'AKAM', 'JNPR', 'FFIV', 'NTAP', 'STX', 'WDC',
  'HPE', 'HPQ', 'DELL', 'CTSH', 'GLW', 'ANET', 'PANW', 'CRWD', 'NOW', 'WDAY',
  'TEAM', 'DDOG', 'ZS', 'NET', 'OKTA', 'SNOW', 'MDB', 'PLTR',
  
  // Communication Services
  'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'EA', 'TTWO', 'LYV',
  'NWSA', 'NWS', 'FOXA', 'FOX', 'OMC', 'IPG', 'MTCH', 'PARA',
  
  // Consumer Discretionary
  'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG', 'ABNB', 'CMG', 'MAR',
  'GM', 'F', 'HLT', 'ORLY', 'AZO', 'YUM', 'ROST', 'DHI', 'LEN', 'PHM',
  'NVR', 'POOL', 'TSCO', 'ULTA', 'DPZ', 'BBY', 'EBAY', 'ETSY', 'DRI', 'GPC',
  'LKQ', 'AAP', 'RL', 'TPR', 'HAS', 'WHR', 'LVS', 'WYNN', 'MGM', 'CZR',
  'NCLH', 'RCL', 'CCL', 'HRB', 'MHK', 'LEG', 'APTV', 'BWA', 'EXPE', 'TRVG',
  
  // Consumer Staples
  'WMT', 'PG', 'COST', 'KO', 'PEP', 'PM', 'MO', 'MDLZ', 'CL', 'KMB',
  'GIS', 'KHC', 'HSY', 'K', 'CAG', 'SJM', 'CPB', 'HRL', 'MKC', 'CHD',
  'CLX', 'TSN', 'KR', 'SYY', 'TAP', 'STZ', 'BF.B', 'MNST', 'KDP', 'DG',
  'DLTR', 'WBA', 'CVS', 'EL', 'ADM', 'BG', 'INGR',
  
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'WMB',
  'KMI', 'HES', 'HAL', 'BKR', 'FANG', 'DVN', 'MRO', 'APA', 'CTRA', 'OVV',
  'EQT', 'TRGP', 'OKE', 'LNG', 'CHRD',
  
  // Financials
  'BRK.B', 'JPM', 'V', 'MA', 'BAC', 'WFC', 'MS', 'GS', 'SPGI', 'BLK',
  'C', 'SCHW', 'AXP', 'CB', 'PGR', 'MMC', 'AON', 'ICE', 'CME', 'MCO',
  'USB', 'PNC', 'TFC', 'COF', 'AIG', 'MET', 'PRU', 'AFL', 'ALL', 'TRV',
  'AJG', 'HIG', 'CINF', 'WRB', 'L', 'GL', 'BRO', 'RJF', 'NTRS', 'STT',
  'BK', 'CFG', 'HBAN', 'RF', 'KEY', 'FITB', 'MTB', 'ZION', 'WTW', 'MKTX',
  'MSCI', 'FDS', 'BEN', 'IVZ', 'TROW', 'JEF', 'SF', 'CBOE', 'FI', 'AMP',
  'ALLY', 'DFS', 'SYF', 'NDAQ', 'LPLA',
  
  // Healthcare
  'UNH', 'LLY', 'JNJ', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'PFE', 'AMGN',
  'BMY', 'GILD', 'VRTX', 'CI', 'ELV', 'HUM', 'MCK', 'COR', 'CAH', 'ISRG',
  'REGN', 'ZTS', 'BSX', 'SYK', 'MDT', 'EW', 'BDX', 'A', 'IQV', 'IDXX',
  'HCA', 'DXCM', 'RMD', 'ALGN', 'PODD', 'HOLX', 'STE', 'BAX', 'TFX', 'TECH',
  'GEHC', 'SOLV', 'MOH', 'UHS', 'DVA', 'HSIC', 'VTRS', 'OGN', 'ZBH', 'BIIB',
  'MRNA', 'ILMN', 'EXAS', 'INCY', 'NBIX', 'ALNY', 'JAZZ', 'UTHR', 'RARE', 'IONS',
  'BMRN', 'SGEN', 'FOLD', 'BLUE', 'RGNX', 'ARVN', 'ARWR', 'FATE', 'SGMO', 'VCYT',
  
  // Industrials
  'GE', 'CAT', 'RTX', 'HON', 'UPS', 'BA', 'LMT', 'DE', 'UNP', 'ADP',
  'GD', 'NOC', 'ETN', 'ITW', 'MMM', 'EMR', 'CSX', 'WM', 'NSC', 'TT',
  'PH', 'PCAR', 'CMI', 'FDX', 'RSG', 'CARR', 'OTIS', 'IR', 'PAYX', 'FAST',
  'VRSK', 'ODFL', 'ROK', 'DOV', 'XYL', 'FTV', 'HUBB', 'AME', 'IEX', 'LDOS',
  'CPRT', 'J', 'EXPD', 'JBHT', 'CHRW', 'SNA', 'PNR', 'DAL', 'UAL', 'AAL',
  'LUV', 'ALK', 'GWW', 'WAB', 'TXT', 'ROL', 'AOS', 'GNRC', 'PWR', 'BLDR',
  'VMI', 'MLI', 'ALLE', 'AXON', 'HWM', 'MIDD', 'NDSN', 'AIT', 'RBC', 'CTAS',
  
  // Materials
  'LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'CTVA', 'DD', 'DOW', 'NUE',
  'VMC', 'MLM', 'PPG', 'STLD', 'ALB', 'CF', 'MOS', 'FMC', 'IFF', 'EMN',
  'CE', 'BALL', 'AVY', 'PKG', 'IP', 'AMCR', 'SEE', 'WRK', 'CLF', 'RS',
  
  // Real Estate
  'AMT', 'PLD', 'EQIX', 'PSA', 'WELL', 'DLR', 'O', 'SPG', 'VICI', 'CBRE',
  'EXR', 'IRM', 'AVB', 'EQR', 'VTR', 'SBAC', 'WY', 'INVH', 'MAA', 'ESS',
  'ARE', 'DOC', 'UDR', 'CPT', 'HST', 'REG', 'BXP', 'FRT', 'KIM', 'VNO',
  'SUI', 'PEAK', 'CCI', 'GLPI', 'LAMR',
  
  // Utilities
  'NEE', 'SO', 'DUK', 'CEG', 'SRE', 'AEP', 'VST', 'D', 'PCG', 'PEG',
  'EXC', 'XEL', 'ED', 'WEC', 'ES', 'AWK', 'DTE', 'PPL', 'AEE', 'CMS',
  'EIX', 'FE', 'ETR', 'CNP', 'NI', 'LNT', 'ATO', 'EVRG', 'PNW', 'NRG',
  'AES', 'PAYC',
];

// Get unique symbols
export const SP500_SYMBOLS_UNIQUE = [...new Set(SP500_SYMBOLS)];

// Comprehensive symbol to sector mapping
export const SYMBOL_TO_SECTOR: Record<string, string> = {
  // === ELECTRONIC TECHNOLOGY ===
  'AAPL': 'Electronic Technology', 'MSFT': 'Electronic Technology', 
  'GOOGL': 'Electronic Technology', 'GOOG': 'Electronic Technology',
  'AMZN': 'Electronic Technology', 'NVDA': 'Electronic Technology',
  'META': 'Electronic Technology', 'TSLA': 'Electronic Technology',
  'AVGO': 'Electronic Technology', 'ORCL': 'Electronic Technology',
  'CRM': 'Electronic Technology', 'ADBE': 'Electronic Technology',
  'AMD': 'Electronic Technology', 'CSCO': 'Electronic Technology',
  'ACN': 'Electronic Technology', 'IBM': 'Electronic Technology',
  'INTU': 'Electronic Technology', 'TXN': 'Electronic Technology',
  'QCOM': 'Electronic Technology', 'AMAT': 'Electronic Technology',
  'MU': 'Electronic Technology', 'INTC': 'Electronic Technology',
  'ADI': 'Electronic Technology', 'LRCX': 'Electronic Technology',
  'KLAC': 'Electronic Technology', 'SNPS': 'Electronic Technology',
  'CDNS': 'Electronic Technology', 'MCHP': 'Electronic Technology',
  'FTNT': 'Electronic Technology', 'ANSS': 'Electronic Technology',
  'ROP': 'Electronic Technology', 'FICO': 'Electronic Technology',
  'MPWR': 'Electronic Technology', 'APH': 'Electronic Technology',
  'ADSK': 'Electronic Technology', 'MSI': 'Electronic Technology',
  'KEYS': 'Electronic Technology', 'ZBRA': 'Electronic Technology',
  'GDDY': 'Electronic Technology', 'PTC': 'Electronic Technology',
  'TYL': 'Electronic Technology', 'TER': 'Electronic Technology',
  'TRMB': 'Electronic Technology', 'VRSN': 'Electronic Technology',
  'AKAM': 'Electronic Technology', 'JNPR': 'Electronic Technology',
  'FFIV': 'Electronic Technology', 'NTAP': 'Electronic Technology',
  'STX': 'Electronic Technology', 'WDC': 'Electronic Technology',
  'HPE': 'Electronic Technology', 'HPQ': 'Electronic Technology',
  'DELL': 'Electronic Technology', 'CTSH': 'Electronic Technology',
  'GLW': 'Electronic Technology', 'ANET': 'Electronic Technology',
  'PANW': 'Electronic Technology', 'CRWD': 'Electronic Technology',
  'NOW': 'Electronic Technology', 'WDAY': 'Electronic Technology',
  'TEAM': 'Electronic Technology', 'DDOG': 'Electronic Technology',
  'ZS': 'Electronic Technology', 'NET': 'Electronic Technology',
  'OKTA': 'Electronic Technology', 'SNOW': 'Electronic Technology',
  'MDB': 'Electronic Technology', 'PLTR': 'Electronic Technology',

  // === COMMUNICATIONS ===
  'NFLX': 'Communications', 'DIS': 'Communications', 'CMCSA': 'Communications',
  'VZ': 'Communications', 'T': 'Communications', 'TMUS': 'Communications',
  'CHTR': 'Communications', 'EA': 'Communications', 'TTWO': 'Communications',
  'LYV': 'Communications', 'NWSA': 'Communications', 'NWS': 'Communications',
  'FOXA': 'Communications', 'FOX': 'Communications', 'OMC': 'Communications',
  'IPG': 'Communications', 'MTCH': 'Communications', 'PARA': 'Communications',

  // === CONSUMER SERVICES ===
  'HD': 'Consumer Services', 'MCD': 'Consumer Services', 'NKE': 'Consumer Services',
  'LOW': 'Consumer Services', 'SBUX': 'Consumer Services', 'TJX': 'Consumer Services',
  'BKNG': 'Consumer Services', 'ABNB': 'Consumer Services', 'CMG': 'Consumer Services',
  'MAR': 'Consumer Services', 'HLT': 'Consumer Services', 'YUM': 'Consumer Services',
  'DHI': 'Consumer Services', 'LEN': 'Consumer Services', 'PHM': 'Consumer Services',
  'POOL': 'Consumer Services', 'ULTA': 'Consumer Services', 'DPZ': 'Consumer Services',
  'DRI': 'Consumer Services', 'HAS': 'Consumer Services', 'WHR': 'Consumer Services',
  'LVS': 'Consumer Services', 'WYNN': 'Consumer Services', 'MGM': 'Consumer Services',
  'CZR': 'Consumer Services', 'NCLH': 'Consumer Services', 'RCL': 'Consumer Services',

  // === RETAIL TRADE ===
  'ORLY': 'Retail Trade', 'AZO': 'Retail Trade', 'ROST': 'Retail Trade',
  'TSCO': 'Retail Trade', 'BBY': 'Retail Trade', 'EBAY': 'Retail Trade',
  'ETSY': 'Retail Trade', 'GPC': 'Retail Trade', 'LKQ': 'Retail Trade',
  'AAP': 'Retail Trade', 'RL': 'Retail Trade', 'TPR': 'Retail Trade',
  'GWW': 'Retail Trade', 'KR': 'Retail Trade', 'COST': 'Retail Trade',
  'WMT': 'Retail Trade', 'DLTR': 'Retail Trade', 'DG': 'Retail Trade',
  'WBA': 'Retail Trade', 'CVS': 'Retail Trade',

  // === CONSUMER NON-DURABLES ===
  'PG': 'Consumer Non-Durables', 'KO': 'Consumer Non-Durables',
  'PEP': 'Consumer Non-Durables', 'PM': 'Consumer Non-Durables',
  'MO': 'Consumer Non-Durables', 'MDLZ': 'Consumer Non-Durables',
  'CL': 'Consumer Non-Durables', 'KMB': 'Consumer Non-Durables',
  'GIS': 'Consumer Non-Durables', 'KHC': 'Consumer Non-Durables',
  'HSY': 'Consumer Non-Durables', 'K': 'Consumer Non-Durables',
  'CAG': 'Consumer Non-Durables', 'SJM': 'Consumer Non-Durables',
  'CPB': 'Consumer Non-Durables', 'HRL': 'Consumer Non-Durables',
  'MKC': 'Consumer Non-Durables', 'CHD': 'Consumer Non-Durables',
  'CLX': 'Consumer Non-Durables', 'TSN': 'Consumer Non-Durables',
  'SYY': 'Consumer Non-Durables', 'TAP': 'Consumer Non-Durables', 
  'STZ': 'Consumer Non-Durables', 'BF.B': 'Consumer Non-Durables', 
  'MNST': 'Consumer Non-Durables', 'KDP': 'Consumer Non-Durables', 
  'EL': 'Consumer Non-Durables', 'ADM': 'Consumer Non-Durables', 
  'BG': 'Consumer Non-Durables', 'INGR': 'Consumer Non-Durables',

  // === ENERGY MINERALS ===
  'XOM': 'Energy Minerals', 'CVX': 'Energy Minerals', 'COP': 'Energy Minerals',
  'SLB': 'Energy Minerals', 'EOG': 'Energy Minerals', 'MPC': 'Energy Minerals',
  'PSX': 'Energy Minerals', 'VLO': 'Energy Minerals', 'OXY': 'Energy Minerals',
  'WMB': 'Energy Minerals', 'KMI': 'Energy Minerals', 'HES': 'Energy Minerals',
  'HAL': 'Energy Minerals', 'BKR': 'Energy Minerals', 'FANG': 'Energy Minerals',
  'DVN': 'Energy Minerals', 'MRO': 'Energy Minerals', 'APA': 'Energy Minerals',
  'CTRA': 'Energy Minerals', 'OVV': 'Energy Minerals', 'EQT': 'Energy Minerals',
  'TRGP': 'Energy Minerals', 'OKE': 'Energy Minerals', 'LNG': 'Energy Minerals',
  'CHRD': 'Energy Minerals', 'FCX': 'Energy Minerals',

  // === FINANCE ===
  'JPM': 'Finance', 'V': 'Finance', 'MA': 'Finance', 'BAC': 'Finance',
  'WFC': 'Finance', 'MS': 'Finance', 'GS': 'Finance', 'SPGI': 'Finance',
  'BLK': 'Finance', 'C': 'Finance', 'SCHW': 'Finance', 'AXP': 'Finance',
  'CB': 'Finance', 'PGR': 'Finance', 'MMC': 'Finance', 'AON': 'Finance',
  'ICE': 'Finance', 'CME': 'Finance', 'MCO': 'Finance', 'USB': 'Finance',
  'PNC': 'Finance', 'TFC': 'Finance', 'COF': 'Finance', 'AIG': 'Finance',
  'MET': 'Finance', 'PRU': 'Finance', 'AFL': 'Finance', 'ALL': 'Finance',
  'TRV': 'Finance', 'AJG': 'Finance', 'HIG': 'Finance', 'CINF': 'Finance',
  'WRB': 'Finance', 'L': 'Finance', 'GL': 'Finance', 'BRO': 'Finance',
  'RJF': 'Finance', 'NTRS': 'Finance', 'STT': 'Finance', 'BK': 'Finance',
  'CFG': 'Finance', 'HBAN': 'Finance', 'RF': 'Finance', 'KEY': 'Finance',
  'FITB': 'Finance', 'MTB': 'Finance', 'ZION': 'Finance', 'WTW': 'Finance',
  'MKTX': 'Finance', 'MSCI': 'Finance', 'FDS': 'Finance', 'BEN': 'Finance',
  'IVZ': 'Finance', 'TROW': 'Finance', 'JEF': 'Finance', 'SF': 'Finance',
  'CBOE': 'Finance', 'FI': 'Finance', 'AMP': 'Finance', 'ALLY': 'Finance',
  'DFS': 'Finance', 'SYF': 'Finance', 'NDAQ': 'Finance', 'LPLA': 'Finance',
  'BRK.B': 'Finance', 'COIN': 'Finance',

  // === HEALTH TECHNOLOGY ===
  'UNH': 'Health Technology', 'LLY': 'Health Technology', 'JNJ': 'Health Technology',
  'ABBV': 'Health Technology', 'MRK': 'Health Technology', 'TMO': 'Health Technology',
  'ABT': 'Health Technology', 'DHR': 'Health Technology', 'PFE': 'Health Technology',
  'AMGN': 'Health Technology', 'BMY': 'Health Technology', 'GILD': 'Health Technology',
  'VRTX': 'Health Technology', 'CI': 'Health Technology', 'ELV': 'Health Technology',
  'HUM': 'Health Technology', 'MCK': 'Health Technology', 'COR': 'Health Technology',
  'CAH': 'Health Technology', 'ISRG': 'Health Technology', 'REGN': 'Health Technology',
  'ZTS': 'Health Technology', 'BSX': 'Health Technology', 'SYK': 'Health Technology',
  'MDT': 'Health Technology', 'EW': 'Health Technology', 'BDX': 'Health Technology',
  'A': 'Health Technology', 'IQV': 'Health Technology', 'IDXX': 'Health Technology',
  'HCA': 'Health Technology', 'DXCM': 'Health Technology', 'RMD': 'Health Technology',
  'ALGN': 'Health Technology', 'PODD': 'Health Technology', 'HOLX': 'Health Technology',
  'STE': 'Health Technology', 'BAX': 'Health Technology', 'TFX': 'Health Technology',
  'TECH': 'Health Technology', 'GEHC': 'Health Technology', 'SOLV': 'Health Technology',
  'MOH': 'Health Technology', 'UHS': 'Health Technology', 'DVA': 'Health Technology',
  'HSIC': 'Health Technology', 'VTRS': 'Health Technology', 'OGN': 'Health Technology',
  'ZBH': 'Health Technology', 'BIIB': 'Health Technology', 'MRNA': 'Health Technology',
  'ILMN': 'Health Technology', 'EXAS': 'Health Technology', 'INCY': 'Health Technology',
  'NBIX': 'Health Technology', 'ALNY': 'Health Technology', 'JAZZ': 'Health Technology',
  'UTHR': 'Health Technology', 'RARE': 'Health Technology', 'IONS': 'Health Technology',
  'BMRN': 'Health Technology', 'SGEN': 'Health Technology', 'FOLD': 'Health Technology',
  'BLUE': 'Health Technology', 'RGNX': 'Health Technology', 'ARVN': 'Health Technology',
  'ARWR': 'Health Technology', 'FATE': 'Health Technology', 'SGMO': 'Health Technology',
  'VCYT': 'Health Technology', 'PKI': 'Health Technology', 'WST': 'Health Technology',
  'WAT': 'Health Technology',

  // === PRODUCER MANUFACTURING ===
  'GE': 'Producer Manufacturing', 'CAT': 'Producer Manufacturing',
  'RTX': 'Producer Manufacturing', 'HON': 'Producer Manufacturing',
  'UPS': 'Producer Manufacturing', 'BA': 'Producer Manufacturing',
  'LMT': 'Producer Manufacturing', 'DE': 'Producer Manufacturing',
  'UNP': 'Producer Manufacturing', 'ADP': 'Producer Manufacturing',
  'GD': 'Producer Manufacturing', 'NOC': 'Producer Manufacturing',
  'ETN': 'Producer Manufacturing', 'ITW': 'Producer Manufacturing',
  'MMM': 'Producer Manufacturing', 'EMR': 'Producer Manufacturing',
  'CSX': 'Producer Manufacturing', 'WM': 'Producer Manufacturing',
  'NSC': 'Producer Manufacturing', 'TT': 'Producer Manufacturing',
  'PH': 'Producer Manufacturing', 'PCAR': 'Producer Manufacturing',
  'CMI': 'Producer Manufacturing', 'FDX': 'Producer Manufacturing',
  'RSG': 'Producer Manufacturing', 'CARR': 'Producer Manufacturing',
  'OTIS': 'Producer Manufacturing', 'IR': 'Producer Manufacturing',
  'PAYX': 'Producer Manufacturing', 'FAST': 'Producer Manufacturing',
  'VRSK': 'Producer Manufacturing', 'ODFL': 'Producer Manufacturing',
  'ROK': 'Producer Manufacturing', 'DOV': 'Producer Manufacturing',
  'XYL': 'Producer Manufacturing', 'FTV': 'Producer Manufacturing',
  'HUBB': 'Producer Manufacturing', 'AME': 'Producer Manufacturing',
  'IEX': 'Producer Manufacturing', 'LDOS': 'Producer Manufacturing',
  'CPRT': 'Producer Manufacturing', 'J': 'Producer Manufacturing',
  'EXPD': 'Producer Manufacturing', 'JBHT': 'Producer Manufacturing',
  'CHRW': 'Producer Manufacturing', 'SNA': 'Producer Manufacturing',
  'PNR': 'Producer Manufacturing', 'DAL': 'Producer Manufacturing',
  'UAL': 'Producer Manufacturing', 'AAL': 'Producer Manufacturing',
  'LUV': 'Producer Manufacturing', 'ALK': 'Producer Manufacturing',
  'WAB': 'Producer Manufacturing',
  'TXT': 'Producer Manufacturing', 'ROL': 'Producer Manufacturing',
  'AOS': 'Producer Manufacturing', 'GNRC': 'Producer Manufacturing',
  'PWR': 'Producer Manufacturing', 'BLDR': 'Producer Manufacturing',
  'VMI': 'Producer Manufacturing', 'MLI': 'Producer Manufacturing',
  'ALLE': 'Producer Manufacturing', 'AXON': 'Producer Manufacturing',
  'HWM': 'Producer Manufacturing', 'MIDD': 'Producer Manufacturing',
  'NDSN': 'Producer Manufacturing', 'AIT': 'Producer Manufacturing',
  'RBC': 'Producer Manufacturing', 'CTAS': 'Producer Manufacturing',
  'APTV': 'Producer Manufacturing', 'BWA': 'Producer Manufacturing',
  'F': 'Producer Manufacturing', 'GM': 'Producer Manufacturing',
  'NVR': 'Producer Manufacturing', 'JCI': 'Producer Manufacturing',
  'HII': 'Producer Manufacturing', 'FBHS': 'Producer Manufacturing',

  // === PROCESS INDUSTRIES ===
  'ALB': 'Process Industries', 'CF': 'Process Industries', 'MOS': 'Process Industries',
  'FMC': 'Process Industries', 'IFF': 'Process Industries', 'EMN': 'Process Industries',
  'CE': 'Process Industries', 'BALL': 'Process Industries', 'AVY': 'Process Industries',
  'PKG': 'Process Industries', 'IP': 'Process Industries', 'AMCR': 'Process Industries',
  'SEE': 'Process Industries', 'WRK': 'Process Industries', 'CLF': 'Process Industries',
  'RS': 'Process Industries', 'LYB': 'Process Industries', 'OLN': 'Process Industries',
  'LIN': 'Process Industries', 'APD': 'Process Industries', 'SHW': 'Process Industries',
  'ECL': 'Process Industries', 'NEM': 'Process Industries', 'CTVA': 'Process Industries',
  'DD': 'Process Industries', 'DOW': 'Process Industries', 'NUE': 'Process Industries',
  'VMC': 'Process Industries', 'MLM': 'Process Industries', 'PPG': 'Process Industries',
  'STLD': 'Process Industries',

  // === COMMERCIAL SERVICES ===
  'AMT': 'Commercial Services', 'PLD': 'Commercial Services', 'EQIX': 'Commercial Services',
  'PSA': 'Commercial Services', 'WELL': 'Commercial Services', 'DLR': 'Commercial Services',
  'O': 'Commercial Services', 'SPG': 'Commercial Services', 'VICI': 'Commercial Services',
  'CBRE': 'Commercial Services', 'EXR': 'Commercial Services', 'IRM': 'Commercial Services',
  'AVB': 'Commercial Services', 'EQR': 'Commercial Services', 'VTR': 'Commercial Services',
  'SBAC': 'Commercial Services', 'WY': 'Commercial Services', 'INVH': 'Commercial Services',
  'MAA': 'Commercial Services', 'ESS': 'Commercial Services', 'UDR': 'Commercial Services',
  'DOC': 'Commercial Services', 'CPT': 'Commercial Services', 'HST': 'Commercial Services',
  'REG': 'Commercial Services', 'BXP': 'Commercial Services', 'FRT': 'Commercial Services',
  'KIM': 'Commercial Services', 'VNO': 'Commercial Services', 'SUI': 'Commercial Services',
  'PEAK': 'Commercial Services', 'CCI': 'Commercial Services', 'GLPI': 'Commercial Services',
  'LAMR': 'Commercial Services', 'ARE': 'Commercial Services',

  // === UTILITIES ===
  'NEE': 'Utilities', 'SO': 'Utilities', 'DUK': 'Utilities', 'CEG': 'Utilities',
  'SRE': 'Utilities', 'AEP': 'Utilities', 'VST': 'Utilities', 'D': 'Utilities',
  'PCG': 'Utilities', 'PEG': 'Utilities', 'EXC': 'Utilities', 'XEL': 'Utilities',
  'ED': 'Utilities', 'WEC': 'Utilities', 'ES': 'Utilities', 'AWK': 'Utilities',
  'DTE': 'Utilities', 'PPL': 'Utilities', 'AEE': 'Utilities', 'CMS': 'Utilities',
  'EIX': 'Utilities', 'FE': 'Utilities', 'ETR': 'Utilities', 'CNP': 'Utilities',
  'NI': 'Utilities', 'LNT': 'Utilities', 'ATO': 'Utilities', 'EVRG': 'Utilities',
  'PNW': 'Utilities', 'NRG': 'Utilities', 'AES': 'Utilities',
};

// S&P 500 symbols grouped by sector for dashboard and analytics
export const SP500_BY_SECTOR = {
  Technology: [
    'AAPL', 'MSFT', 'NVDA', 'AVGO', 'ORCL', 'ADBE', 'CRM', 'CSCO', 'ACN', 'AMD',
    'INTU', 'IBM', 'NOW', 'AMAT', 'TXN', 'QCOM', 'INTC', 'ADI', 'LRCX', 'KLAC',
    'ANET', 'SNPS', 'CDNS', 'MU', 'FTNT', 'MSI', 'HPQ', 'GLW', 'MCHP', 'TER',
    'TRMB', 'CTSH', 'JNPR', 'AKAM', 'NTAP', 'STX', 'WDC', 'LDOS', 'HPE', 'ZBRA',
    'PTC', 'NET', 'DOCU', 'VRSN', 'PAYC', 'TYL', 'GDDY', 'CDW', 'FFIV', 'DELL'
  ],

  Communication_Services: [
    'META', 'GOOGL', 'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'EA',
    'TTWO', 'LYV', 'OMC', 'IPG', 'PARA', 'FOX', 'FOXA', 'NWSA', 'NWS', 'MTCH'
  ],

  Financial: [
    'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'SPGI', 'BLK', 'AXP',
    'SCHW', 'C', 'CB', 'MMC', 'PGR', 'AON', 'ICE', 'CME', 'MCO', 'AJG',
    'BK', 'TROW', 'MSCI', 'STT', 'ALL', 'PRU', 'MET', 'AFL', 'TRV', 'FITB',
    'HBAN', 'RF', 'KEY', 'CFG', 'MTB', 'PNC', 'USB', 'DFS', 'SYF', 'COF',
    'NDAQ', 'RJF', 'BRO', 'WRB', 'L', 'PFG', 'AIG', 'HIG', 'CINF', 'BEN',
    'IVZ', 'JEF', 'SF', 'CBOE', 'FI', 'AMP', 'ALLY', 'BRK.B', 'COIN', 'LPLA'
  ],

  Healthcare: [
    'UNH', 'LLY', 'JNJ', 'ABBV', 'MRK', 'TMO', 'PFE', 'ABT', 'DHR', 'AMGN',
    'BMY', 'GILD', 'VRTX', 'CVS', 'ELV', 'HUM', 'CI', 'BIIB', 'REGN', 'ISRG',
    'ZTS', 'SYK', 'BDX', 'IDXX', 'EW', 'DXCM', 'MRNA', 'ILMN', 'WST', 'HCA',
    'MCK', 'CAH', 'ABC', 'BSX', 'MDT', 'RMD', 'IQV', 'HOLX', 'BAX', 'DGX',
    'UHS', 'LH', 'COO', 'MTD', 'TECH', 'PODD', 'STE', 'DVA', 'ALGN', 'HSIC',
    'XRAY', 'NBIX', 'INCY', 'BMRN', 'RGEN', 'BLUE', 'RARE', 'VCYT', 'ARVN',
    'ARWR', 'FATE', 'SGMO', 'SGEN', 'FOLD', 'RGNX', 'PKI', 'WAT'
  ],

  Consumer_Discretionary: [
    'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG', 'ORLY',
    'AZO', 'GM', 'F', 'MAR', 'YUM', 'CMG', 'LEN', 'DHI', 'NVR', 'PHM',
    'ROST', 'ULTA', 'ETSY', 'EXPE', 'RCL', 'CCL', 'NCLH', 'MGM', 'WYNN',
    'LKQ', 'BBY', 'GPC', 'AAP', 'HAS', 'TPR', 'RL', 'TAP', 'LEG', 'DLTR',
    'DG', 'POOL', 'DRI', 'ABNB', 'TSCO', 'PVH', 'HRB', 'MHK'
  ],

  Consumer_Staples: [
    'PG', 'WMT', 'COST', 'KO', 'PEP', 'PM', 'MO', 'MDLZ', 'CL', 'KMB',
    'KHC', 'SYY', 'CAG', 'HSY', 'GIS', 'K', 'ADM', 'TSN', 'CPB', 'HRL',
    'MKC', 'CHD', 'SJM', 'KR', 'WBA', 'CLX', 'STZ', 'BF.B', 'MNST', 'EL',
    'BG', 'INGR', 'KDP', 'CVS'
  ],

  Energy: [
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'WMB',
    'KMI', 'HES', 'BKR', 'FANG', 'DVN', 'MRO', 'PXD', 'HAL', 'OKE', 'TRGP',
    'LNG', 'EQT', 'CTRA', 'APA', 'OVV', 'CHRD'
  ],

  Industrials: [
    'UPS', 'CAT', 'RTX', 'HON', 'BA', 'LMT', 'GE', 'DE', 'UNP', 'ADP',
    'GD', 'NOC', 'CSX', 'WM', 'NSC', 'EMR', 'ITW', 'MMM', 'ETN', 'CARR',
    'TT', 'FDX', 'JCI', 'OTIS', 'CPRT', 'FAST', 'GWW', 'ROK', 'AME', 'DOV',
    'IR', 'PWR', 'VMI', 'XYL', 'WAB', 'GNRC', 'J', 'LDOS', 'TXT', 'HII',
    'RHI', 'AOS', 'PH', 'PNR', 'IEX', 'MIDD', 'NDSN', 'EXPD', 'JBHT', 'CHRW',
    'SNA', 'DAL', 'UAL', 'AAL', 'LUV', 'ALK'
  ],

  Materials: [
    'LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'CTVA', 'DD', 'DOW', 'NUE',
    'VMC', 'MLM', 'PPG', 'STLD', 'ALB', 'CF', 'MOS', 'FMC', 'IFF', 'EMN',
    'CE', 'AVY', 'BALL', 'WRK', 'IP', 'PKG', 'SEE', 'OLN', 'RPM', 'AXTA',
    'LYB', 'RS', 'CLF'
  ],

  'Real Estate': [
    'AMT', 'PLD', 'EQIX', 'PSA', 'WELL', 'DLR', 'O', 'SPG', 'VICI', 'CBRE',
    'EXR', 'AVB', 'EQR', 'VTR', 'SBAC', 'WY', 'MAA', 'ESS', 'UDR', 'ARE',
    'KIM', 'REG', 'FRT', 'BXP', 'HST', 'PEAK', 'CPT', 'IRM', 'VNO', 'SUI',
    'CCI', 'GLPI', 'LAMR', 'DOC'
  ],

  Utilities: [
    'NEE', 'SO', 'DUK', 'CEG', 'SRE', 'AEP', 'D', 'EXC', 'XEL', 'PEG',
    'WEC', 'ES', 'AWK', 'DTE', 'PPL', 'AEE', 'CMS', 'LNT', 'ETR', 'FE',
    'AES', 'NRG', 'EIX', 'PNW', 'ED', 'NI', 'CNP', 'ATO', 'EVRG'
  ]
};

// Sectors for analytics and dashboard
export const SECTORS = [
  'Electronic Technology',
  'Communications',
  'Consumer Services',
  'Retail Trade',
  'Consumer Non-Durables',
  'Energy Minerals',
  'Finance',
  'Health Technology',
  'Producer Manufacturing',
  'Process Industries',
  'Commercial Services',
  'Utilities',
];

// Get all companies in a sector
export function getCompaniesBySector(sector: string): string[] {
  return Object.entries(SYMBOL_TO_SECTOR)
    .filter(([, s]) => s === sector)
    .map(([symbol]) => symbol);
}

// Get sector for a symbol
export function getSectorForSymbol(symbol: string): string | undefined {
  return SYMBOL_TO_SECTOR[symbol];
}

// Validate if a symbol exists in S&P 500
export function isValidSymbol(symbol: string): boolean {
  return SP500_SYMBOLS_UNIQUE.includes(symbol);
}
