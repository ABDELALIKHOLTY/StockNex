// ===== ADMIN CREDENTIALS =====
export const ADMIN_CREDENTIALS = {
  email: 'admin@stocknex.com',
  password: 'Admin123!StockNex', // Change this to a secure password
};

export const Nav_Items = [
    { href: '/', label: 'Dashboard' },
    { href: '/search', label: 'Search' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/prediction', label: 'Prediction' },
    
];

// Import from centralized source
export { SYMBOL_TO_SECTOR } from '@shared/data/sp500-symbols';

// Keep other constants
export const COMPANY_SIZE_MULTIPLIERS: { [key: string]: number } = {
  'MMM': 1.2, 'AOS': 1.1, 'ABT': 1.4, 'ABBV': 1.6, 'ABMD': 1.1,
  'ACN': 1.5, 'ATVI': 1.3, 'ADM': 1.2, 'ADBE': 1.5, 'ADP': 1.3,
  'AAP': 1.1, 'AES': 1.0, 'AFL': 1.2, 'A': 1.1, 'APD': 1.2,
  'AKAM': 1.1, 'ALK': 1.0, 'ALB': 1.2, 'ARE': 1.1, 'ALGN': 1.2,
  'ALLE': 1.1, 'LNT': 1.0, 'ALL': 1.3, 'GOOGL': 2.1,
  'MO': 1.2, 'AMZN': 2.0, 'AMCR': 1.0, 'AMD': 1.5, 'AEE': 1.0,
  'AAL': 1.1, 'AEP': 1.1, 'AXP': 1.4, 'AIG': 1.2, 'AMT': 1.2,
  'AWK': 1.1, 'AMP': 1.2, 'ABC': 1.2, 'AME': 1.2, 'AMGN': 1.4,
  'APH': 1.2, 'ADI': 1.2, 'ANSS': 1.1, 'ANTM': 1.2, 'AON': 1.3,
  'APA': 1.0, 'AAPL': 2.2, 'AMAT': 1.2, 'APTV': 1.1, 'ANET': 1.3,
  'AJG': 1.2, 'AIZ': 1.1, 'T': 1.3, 'ATO': 1.0, 'ADSK': 1.3,
  'AZO': 1.3, 'AVB': 1.1, 'AVY': 1.1, 'BKR': 1.1,
  'BLL': 1.1, 'BAC': 1.7, 'BBWI': 1.1, 'BAX': 1.2, 'BDX': 1.3,
  'BRK.B': 1.7, 'BBY': 1.2, 'BIO': 1.1, 'TECH': 1.1, 'BIIB': 1.3,
  'BLK': 1.3, 'BK': 1.2, 'BA': 1.5, 'BKNG': 1.5, 'BWA': 1.0,
  'BXP': 1.1, 'BSX': 1.3, 'BMY': 1.3, 'AVGO': 1.7, 'BR': 1.1,
  'BRO': 1.1, 'BF.B': 1.0, 'CHRW': 1.1, 'CDNS': 1.2, 'CZR': 1.1,
  'CPB': 1.0, 'COF': 1.3, 'CAH': 1.2, 'KMX': 1.2, 'CCL': 1.1,
  'CARR': 1.2, 'CTLT': 1.1, 'CAT': 1.4, 'CBOE': 1.1, 'CBRE': 1.2,
  'CDW': 1.2, 'CE': 1.1, 'CNC': 1.3, 'CNP': 1.0, 'CDAY': 1.1,
  'CERN': 1.1, 'CF': 1.1, 'CRL': 1.1, 'SCHW': 1.3, 'CHTR': 1.2,
  'CVX': 1.5, 'CMG': 1.3, 'CB': 1.3, 'CHD': 1.1, 'CI': 1.2,
  'CINF': 1.1, 'CTAS': 1.2, 'CSCO': 1.4, 'C': 1.5, 'CFG': 1.1,
  'CTXS': 1.1, 'CLX': 1.1, 'CME': 1.1, 'CMS': 1.0, 'KO': 1.4,
  'CTSH': 1.2, 'CL': 1.3, 'CMCSA': 1.3, 'CMA': 1.1, 'CAG': 1.0,
  'COP': 1.3, 'ED': 1.1, 'STZ': 1.2, 'COO': 1.1, 'CPRT': 1.2,
  'GLW': 1.2, 'CTVA': 1.2, 'COST': 1.6, 'CTRA': 1.1, 'CCI': 1.1,
  'CSX': 1.3, 'CMI': 1.2, 'CVS': 1.3, 'DHI': 1.2, 'DHR': 1.4,
  'DRI': 1.1, 'DVA': 1.1, 'DE': 1.2, 'DAL': 1.2, 'XRAY': 1.1,
  'DVN': 1.1, 'DXCM': 1.2, 'FANG': 1.1, 'DLR': 1.1, 'DFS': 1.2,
  'DISCA': 1.1, 'DISCK': 1.1, 'DISH': 1.0, 'DG': 1.2, 'DLTR': 1.1,
  'D': 1.0, 'DPZ': 1.2, 'DOV': 1.1, 'DOW': 1.2, 'DTE': 1.0,
  'DUK': 1.1, 'DRE': 1.0, 'DD': 1.2, 'DXC': 1.0, 'EMN': 1.1,
  'ETN': 1.2, 'EBAY': 1.2, 'ECL': 1.2, 'EIX': 1.0, 'EW': 1.2,
  'EA': 1.2, 'EMR': 1.2, 'ENPH': 1.2, 'ETR': 1.0, 'EOG': 1.1,
  'EPAM': 1.2, 'EQT': 1.0, 'EFX': 1.1, 'EQIX': 1.1, 'EQR': 1.1,
  'ESS': 1.0, 'EL': 1.1, 'ETSY': 1.2, 'RE': 1.1, 'EVRG': 1.0,
  'ES': 1.0, 'EXC': 1.1, 'EXPE': 1.2, 'EXPD': 1.2, 'EXR': 1.1,
  'XOM': 1.6, 'FFIV': 1.1, 'FB': 1.9, 'FAST': 1.2, 'FRT': 1.0,
  'FDX': 1.3, 'FIS': 1.2, 'FITB': 1.1, 'FE': 1.0, 'FRC': 1.1,
  'FISV': 1.3, 'FLT': 1.2, 'FMC': 1.1, 'F': 1.2, 'FTNT': 1.2,
  'FTV': 1.2, 'FBHS': 1.1, 'FOXA': 1.1, 'FOX': 1.1, 'BEN': 1.1,
  'FCX': 1.2, 'GPS': 1.1, 'GRMN': 1.1, 'IT': 1.2, 'GNRC': 1.2,
  'GD': 1.2, 'GE': 1.3, 'GIS': 1.2, 'GM': 1.3, 'GPC': 1.1,
  'GILD': 1.3, 'GL': 1.1, 'GPN': 1.2, 'GS': 1.5, 'GWW': 1.2,
  'HAL': 1.1, 'HBI': 1.0, 'HIG': 1.1, 'HAS': 1.1, 'HCA': 1.2,
  'PEAK': 1.0, 'HSIC': 1.1, 'HSY': 1.1, 'HES': 1.1, 'HPE': 1.1,
  'HLT': 1.2, 'HOLX': 1.1, 'HD': 1.5, 'HON': 1.3, 'HRL': 1.0,
  'HST': 1.1, 'HWM': 1.1, 'HPQ': 1.1, 'HUM': 1.3, 'HBAN': 1.1,
  'HII': 1.1, 'IBM': 1.3, 'IEX': 1.1, 'IDXX': 1.2, 'INFO': 1.2,
  'ITW': 1.2, 'ILMN': 1.2, 'INCY': 1.1, 'IR': 1.1, 'INTC': 1.5,
  'ICE': 1.2, 'IFF': 1.1, 'IP': 1.1, 'IPG': 1.1, 'INTU': 1.3,
  'ISRG': 1.3, 'IVZ': 1.1, 'IPGP': 1.1, 'IQV': 1.2, 'IRM': 1.1,
  'JKHY': 1.1, 'J': 1.1, 'JBHT': 1.1, 'JNJ': 1.7, 'JCI': 1.2,
  'JPM': 1.8, 'JNPR': 1.1, 'K': 1.1, 'KEY': 1.1, 'KEYS': 1.2,
  'KMB': 1.1, 'KIM': 1.0, 'KMI': 1.1, 'KLAC': 1.1, 'KHC': 1.2,
  'KR': 1.1, 'LHX': 1.2, 'LH': 1.1, 'LRCX': 1.2, 'LW': 1.1,
  'LVS': 1.2, 'LEG': 1.0, 'LDOS': 1.2, 'LEN': 1.2, 'LLY': 1.7,
  'LNC': 1.1, 'LIN': 1.3, 'LYV': 1.2, 'LKQ': 1.1, 'LMT': 1.2,
  'L': 1.1, 'LOW': 1.3, 'LUMN': 1.0, 'LYB': 1.2, 'MTB': 1.1,
  'MRO': 1.0, 'MPC': 1.1, 'MKTX': 1.1, 'MAR': 1.2, 'MMC': 1.3,
  'MLM': 1.1, 'MAS': 1.1, 'MA': 1.5, 'MTCH': 1.2, 'MKC': 1.1,
  'MCD': 1.4, 'MCK': 1.2, 'MDT': 1.3, 'MRK': 1.4, 'MET': 1.2,
  'MTD': 1.2, 'MGM': 1.2, 'MCHP': 1.2, 'MU': 1.2, 'MSFT': 2.1,
  'MAA': 1.0, 'MRNA': 1.3, 'MHK': 1.1, 'TAP': 1.0, 'MDLZ': 1.2,
  'MPWR': 1.2, 'MNST': 1.2, 'MCO': 1.3, 'MS': 1.4, 'MOS': 1.0,
  'MSI': 1.2, 'MSCI': 1.2, 'NDAQ': 1.2, 'NTAP': 1.1, 'NFLX': 1.6,
  'NWL': 1.0, 'NEM': 1.5, 'NWSA': 1.1, 'NWS': 1.1, 'NEE': 1.2,
  'NLSN': 1.1, 'NKE': 1.4, 'NI': 1.0, 'NSC': 1.2, 'NTRS': 1.1,
  'NOC': 1.2, 'NLOK': 1.1, 'NCLH': 1.1, 'NRG': 1.0, 'NUE': 1.4,
  'NVDA': 2.2, 'NVR': 1.2, 'NXPI': 1.2, 'ORLY': 1.2, 'OXY': 1.1,
  'ODFL': 1.2, 'OMC': 1.1, 'OKE': 1.1, 'ORCL': 1.6, 'OGN': 1.1,
  'OTIS': 1.2, 'PCAR': 1.2, 'PKG': 1.1, 'PH': 1.2, 'PAYX': 1.2,
  'PAYC': 1.2, 'PYPL': 1.2, 'PENN': 1.1, 'PNR': 1.1, 'PBCT': 1.0,
  'PEP': 1.4, 'PKI': 1.1, 'PFE': 1.5, 'PM': 1.2, 'PSX': 1.0,
  'PNW': 1.0, 'PXD': 1.1, 'PNC': 1.2, 'POOL': 1.2, 'PPG': 1.2,
  'PPL': 1.0, 'PFG': 1.1, 'PG': 1.5, 'PGR': 1.2, 'PLD': 1.2,
  'PRU': 1.1, 'PEG': 1.0, 'PSA': 1.1, 'PHM': 1.1, 'PVH': 1.1,
  'QRVO': 1.1, 'PWR': 1.1, 'QCOM': 1.3, 'DGX': 1.1, 'RL': 1.1,
  'RJF': 1.1, 'RTX': 1.3, 'O': 1.1, 'REG': 1.0, 'REGN': 1.3,
  'RF': 1.1, 'RSG': 1.1, 'RMD': 1.2, 'RHI': 1.1, 'ROK': 1.2,
  'ROL': 1.1, 'ROP': 1.2, 'ROST': 1.2, 'RCL': 1.1, 'SPGI': 1.2,
  'CRM': 1.6, 'SBAC': 1.1, 'SLB': 1.2, 'STX': 1.1, 'SEE': 1.0,
  'SRE': 1.1, 'NOW': 1.3, 'SHW': 1.2, 'SPG': 1.2, 'SWKS': 1.1,
  'SNA': 1.1, 'SO': 1.1, 'LUV': 1.2, 'SWK': 1.1, 'SBUX': 1.3,
  'STT': 1.1, 'STE': 1.1, 'SYK': 1.3, 'SIVB': 1.1, 'SYF': 1.2,
  'SNPS': 1.2, 'SYY': 1.2, 'TMUS': 1.4, 'TROW': 1.2, 'TTWO': 1.2,
  'TPR': 1.1, 'TGT': 1.4, 'TEL': 1.2, 'TDY': 1.2, 'TFX': 1.1,
  'TER': 1.1, 'TSLA': 1.8, 'TXN': 1.4, 'TXT': 1.1, 'TMO': 1.5,
  'TJX': 1.3, 'TSCO': 1.2, 'TT': 1.2, 'TDG': 1.2, 'TRV': 1.3,
  'TRMB': 1.1, 'TFC': 1.2, 'TWTR': 1.2, 'TYL': 1.2, 'TSN': 1.1,
  'UDR': 1.0, 'ULTA': 1.2, 'USB': 1.2, 'UAA': 1.0, 'UA': 1.0,
  'UNP': 1.3, 'UAL': 1.1, 'UNH': 1.8, 'UPS': 1.4, 'URI': 1.2,
  'UHS': 1.1, 'VLO': 1.1, 'VTR': 1.0, 'VRSN': 1.1, 'VRSK': 1.2,
  'VZ': 1.4, 'VRTX': 1.2, 'VFC': 1.1, 'VIAC': 1.1, 'VTRS': 1.1,
  'V': 1.6, 'VNO': 1.0, 'VMC': 1.1, 'WRB': 1.1, 'WAB': 1.1,
  'WMT': 1.7, 'WBA': 1.2, 'DIS': 1.4, 'WM': 1.2, 'WAT': 1.2,
  'WEC': 1.0, 'WFC': 1.6, 'WELL': 1.1, 'WST': 1.1, 'WDC': 1.1,
  'WU': 1.1, 'WRK': 1.1, 'WY': 1.1, 'WHR': 1.1, 'WMB': 1.1,
  'WYNN': 1.1, 'XEL': 1.0, 'XLNX': 1.1, 'XYL': 1.1, 'YUM': 1.2,
  'ZBRA': 1.3, 'ZBH': 1.2, 'ZION': 1.0, 'ZTS': 1.2,
  
  // Default value for any company not listed
  'DEFAULT': 0.20,
};




































// Configuration globale de sécurité TradingView
export const TRADINGVIEW_SECURITY_CONFIG = {
    blockExternalLinks: true,
    blockSymbolClickNavigation: true,
    blockCopyright: true,
    blockLogo: true,
    blockedDomains: ['tradingview.com', 'www.tradingview', 'charts.tradingview.com'],
    allowedInternalPaths: ['/search', '/watchlist'],
};

// Sign-up form select options
export const INVESTMENT_GOALS = [
    { value: 'Growth', label: 'Growth' },
    { value: 'Income', label: 'Income' },
    { value: 'Balanced', label: 'Balanced' },
    { value: 'Conservative', label: 'Conservative' },
];

export const RISK_TOLERANCE_OPTIONS = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
];

export const PREFERRED_INDUSTRIES = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Consumer Goods', label: 'Consumer Goods' },
];

export const ALERT_TYPE_OPTIONS = [
    { value: 'upper', label: 'Upper' },
    { value: 'lower', label: 'Lower' },
];

export const CONDITION_OPTIONS = [
    { value: 'greater', label: 'Greater than (>)' },
    { value: 'less', label: 'Less than (<)' },
];

// TradingView Charts
export const MARKET_OVERVIEW_WIDGET_CONFIG = {
    colorTheme: 'dark', // dark mode
    dateRange: '12M', // last 12 months
    locale: 'en', // language
    largeChartUrl: '', // link to a large chart if needed
    isTransparent: true, // makes background transparent
    showFloatingTooltip: true, // show tooltip on hover
    plotLineColorGrowing: '#0FEDBE', // line color when price goes up
    plotLineColorFalling: '#0FEDBE', // line color when price falls
    gridLineColor: 'rgba(240, 243, 250, 0)', // grid line color
    scaleFontColor: '#DBDBDB', // font color for scale
    belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)', // fill under line when growing
    belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)', // fill under line when falling
    belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
    belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
    symbolActiveColor: 'rgba(15, 237, 190, 0.05)', // highlight color for active symbol
    tabs: [
        {
            title: 'Financial',
            symbols: [
                { s: 'NYSE:JPM', d: 'JPMorgan Chase' },
                { s: 'NYSE:WFC', d: 'Wells Fargo Co New' },
                { s: 'NYSE:BAC', d: 'Bank Amer Corp' },
                { s: 'NYSE:HSBC', d: 'Hsbc Hldgs Plc' },
                { s: 'NYSE:C', d: 'Citigroup Inc' },
                { s: 'NYSE:MA', d: 'Mastercard Incorporated' },
            ],
        },
        {
            title: 'Technology',
            symbols: [
                { s: 'NASDAQ:AAPL', d: 'Apple' },
                { s: 'NASDAQ:GOOGL', d: 'Alphabet' },
                { s: 'NASDAQ:MSFT', d: 'Microsoft' },
                { s: 'NASDAQ:FB', d: 'Meta Platforms' },
                { s: 'NYSE:ORCL', d: 'Oracle Corp' },
                { s: 'NASDAQ:INTC', d: 'Intel Corp' },
            ],
        },
        {
            title: 'Services',
            symbols: [
                { s: 'NASDAQ:AMZN', d: 'Amazon' },
                { s: 'NYSE:BABA', d: 'Alibaba Group Hldg Ltd' },
                { s: 'NYSE:T', d: 'At&t Inc' },
                { s: 'NYSE:WMT', d: 'Walmart' },
                { s: 'NYSE:V', d: 'Visa' },
            ],
        },
    ],
    support_host: 'https://www.tradingview.com', // TradingView host
    backgroundColor: '#141414', // background color
    width: '100%', // full width
    height: 600, // height in px
    showSymbolLogo: true, // show logo next to symbols
    showChart: true, // display mini chart
};

export const HEATMAP_WIDGET_CONFIG = {
    dataSource: 'SPX500',
    blockSize: 'market_cap_basic',
    blockColor: 'change',
    grouping: 'sector',
    isTransparent: true,
    locale: 'en',
    symbolUrl: '',
    colorTheme: 'dark',
    exchanges: [],
    hasTopBar: false,
    isDataSetEnabled: false,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    isMonoSize: false,
    width: '100%',
    height: '600',
};

export const TOP_STORIES_WIDGET_CONFIG = {
    displayMode: 'regular',
    feedMode: 'market',
    colorTheme: 'dark',
    isTransparent: true,
    locale: 'en',
    market: 'stock',
    width: '100%',
    height: '600',
};

export const MARKET_DATA_WIDGET_CONFIG = {
    title: 'Stocks',
    width: '100%',
    height: 600,
    locale: 'en',
    showSymbolLogo: true,
    colorTheme: 'dark',
    isTransparent: false,
    backgroundColor: '#0F0F0F',
    symbolsGroups: [
        {
            name: 'Financial',
            symbols: [
                { name: 'NYSE:JPM', displayName: 'JPMorgan Chase' },
                { name: 'NYSE:WFC', displayName: 'Wells Fargo Co New' },
                { name: 'NYSE:BAC', displayName: 'Bank Amer Corp' },
                { name: 'NYSE:HSBC', displayName: 'Hsbc Hldgs Plc' },
                { name: 'NYSE:C', displayName: 'Citigroup Inc' },
                { name: 'NYSE:MA', displayName: 'Mastercard Incorporated' },
            ],
        },
        {
            name: 'Technology',
            symbols: [
                { name: 'NASDAQ:AAPL', displayName: 'Apple' },
                { name: 'NASDAQ:GOOGL', displayName: 'Alphabet' },
                { name: 'NASDAQ:MSFT', displayName: 'Microsoft' },
                { name: 'NASDAQ:FB', displayName: 'Meta Platforms' },
                { name: 'NYSE:ORCL', displayName: 'Oracle Corp' },
                { name: 'NASDAQ:INTC', displayName: 'Intel Corp' },
            ],
        },
        {
            name: 'Services',
            symbols: [
                { name: 'NASDAQ:AMZN', displayName: 'Amazon' },
                { name: 'NYSE:BABA', displayName: 'Alibaba Group Hldg Ltd' },
                { name: 'NYSE:T', displayName: 'At&t Inc' },
                { name: 'NYSE:WMT', displayName: 'Walmart' },
                { name: 'NYSE:V', displayName: 'Visa' },
            ],
        },
    ],
};

export const SYMBOL_INFO_WIDGET_CONFIG = (symbol: string) => ({
    symbol: symbol.toUpperCase(),
    colorTheme: 'dark',
    isTransparent: true,
    locale: 'en',
    width: '100%',
    height: 170,
});

export const CANDLE_CHART_WIDGET_CONFIG = (symbol: string) => ({
    allow_symbol_change: false,
    calendar: false,
    details: true,
    hide_side_toolbar: true,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_volume: false,
    hotlist: false,
    interval: 'D',
    locale: 'en',
    save_image: false,
    style: 1,
    symbol: symbol.toUpperCase(),
    theme: 'dark',
    timezone: 'Etc/UTC',
    backgroundColor: '#141414',
    gridColor: '#141414',
    watchlist: [],
    withdateranges: false,
    compareSymbols: [],
    studies: [],
    width: '100%',
    height: 600,
});

export const BASELINE_WIDGET_CONFIG = (symbol: string) => ({
    allow_symbol_change: false,
    calendar: false,
    details: false,
    hide_side_toolbar: true,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_volume: false,
    hotlist: false,
    interval: 'D',
    locale: 'en',
    save_image: false,
    style: 10,
    symbol: symbol.toUpperCase(),
    theme: 'dark',
    timezone: 'Etc/UTC',
    backgroundColor: '#141414',
    gridColor: '#141414',
    watchlist: [],
    withdateranges: false,
    compareSymbols: [],
    studies: [],
    width: '100%',
    height: 600,
});

export const TECHNICAL_ANALYSIS_WIDGET_CONFIG = (symbol: string) => ({
    symbol: symbol.toUpperCase(),
    colorTheme: 'dark',
    isTransparent: 'true',
    locale: 'en',
    width: '100%',
    height: 400,
    interval: '1h',
    largeChartUrl: '',
});

export const COMPANY_PROFILE_WIDGET_CONFIG = (symbol: string) => ({
    symbol: symbol.toUpperCase(),
    colorTheme: 'dark',
    isTransparent: 'true',
    locale: 'en',
    width: '100%',
    height: 440,
});

export const COMPANY_FINANCIALS_WIDGET_CONFIG = (symbol: string) => ({
    symbol: symbol.toUpperCase(),
    colorTheme: 'dark',
    isTransparent: 'true',
    locale: 'en',
    width: '100%',
    height: 464,
    displayMode: 'regular',
    largeChartUrl: '',
});

export const POPULAR_STOCK_SYMBOLS = [
    // Tech Giants (the big technology companies)
    'AAPL',
    'MSFT',
    'GOOGL',
    'AMZN',
    'TSLA',
    'META',
    'NVDA',
    'NFLX',
    'ORCL',
    'CRM',

    // Growing Tech Companies
    'ADBE',
    'INTC',
    'AMD',
    'PYPL',
    'UBER',
    'ZOOM',
    'SPOT',
    'SQ',
    'SHOP',
    'ROKU',

    // Newer Tech Companies
    'SNOW',
    'PLTR',
    'COIN',
    'RBLX',
    'DDOG',
    'CRWD',
    'NET',
    'OKTA',
    'TWLO',
    'ZM',

    // Consumer & Delivery Apps
    'DOCU',
    'PTON',
    'PINS',
    'SNAP',
    'LYFT',
    'DASH',
    'ABNB',
    'RIVN',
    'LCID',
    'NIO',

    // International Companies
    'XPEV',
    'LI',
    'BABA',
    'JD',
    'PDD',
    'TME',
    'BILI',
    'DIDI',
    'GRAB',
    'SE',
];

export const NO_MARKET_NEWS =
    '<p class="mobile-text" style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#4b5563;">No market news available today. Please check back tomorrow.</p>';

export const WATCHLIST_TABLE_HEADER = [
    'Company',
    'Symbol',
    'Price',
    'Change',
    'Market Cap',
    'P/E Ratio',
    'Alert',
    'Action',
];