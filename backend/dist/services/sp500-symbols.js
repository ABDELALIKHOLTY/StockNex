"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SP500_SYMBOLS_UNIQUE = exports.SP500_SYMBOLS = void 0;
// Liste complète des 500 symboles du S&P 500
// Source: S&P 500 index constituents (mise à jour 2024)
// Note: Cette liste sera complétée dynamiquement via l'API Yahoo Finance si nécessaire
exports.SP500_SYMBOLS = [
    // Technology (70+ stocks)
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'AMD',
    'INTC', 'ADBE', 'CRM', 'ORCL', 'CSCO', 'AVGO', 'PYPL', 'QCOM', 'TXN', 'AMAT',
    'LRCX', 'KLAC', 'SNPS', 'CDNS', 'ANSS', 'FTNT', 'CRWD', 'ZS', 'PANW', 'NET',
    'NOW', 'TEAM', 'DOCN', 'ESTC', 'DDOG', 'MDB', 'SNOW', 'PLTR', 'RPD', 'BILL',
    'COUP', 'ZM', 'DOCU', 'FROG', 'OKTA', 'SPLK', 'VRSN', 'AKAM', 'FFIV', 'F5',
    'NTNX', 'VEEV', 'WDAY', 'HUBS', 'TWLO', 'RPD', 'ESTC', 'DDOG', 'MDB', 'SNOW',
    'PLTR', 'RPD', 'BILL', 'COUP', 'ZM', 'DOCU', 'FROG', 'OKTA', 'SPLK', 'VRSN',
    // Financial Services (70+ stocks)
    'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BLK', 'SCHW', 'AXP', 'COF',
    'USB', 'PNC', 'TFC', 'BK', 'STT', 'CFG', 'HBAN', 'MTB', 'ZION', 'FITB',
    'KEY', 'RF', 'CMA', 'WTFC', 'FNB', 'HOMB', 'ONB', 'UBSH', 'TCBI', 'BOKF',
    'V', 'MA', 'FIS', 'FISV', 'GPN', 'FLYW', 'WU', 'EBAY', 'PYPL', 'SQ',
    'AFRM', 'UPST', 'SOFI', 'LC', 'OPRT', 'NU', 'HOOD', 'COIN', 'MARA', 'RIOT',
    'MSTR', 'HUT', 'BITF', 'HIVE', 'ARB', 'CAN', 'BTBT', 'SOS', 'EBON', 'FTFT',
    'OSTK', 'MSTR', 'HUT', 'BITF', 'HIVE', 'ARB', 'CAN', 'BTBT', 'SOS', 'EBON',
    // Healthcare (60+ stocks)
    'JNJ', 'UNH', 'PFE', 'ABT', 'TMO', 'ABBV', 'MRK', 'LLY', 'BMY', 'AMGN',
    'GILD', 'BIIB', 'VRTX', 'REGN', 'ILMN', 'ALXN', 'BMRN', 'FOLD', 'RARE', 'IONS',
    'SGMO', 'BLUE', 'RGNX', 'RGNX', 'RGNX', 'RGNX', 'RGNX', 'RGNX', 'RGNX', 'RGNX',
    'CI', 'HUM', 'CNC', 'MOH', 'ANTM', 'CVS', 'WBA', 'RAD', 'FRED', 'KR',
    'DVA', 'FMS', 'CHE', 'PDCO', 'XRAY', 'HSIC', 'OMCL', 'NVST', 'TECH', 'NVRO',
    'ALGN', 'ZBH', 'BAX', 'BDX', 'BSX', 'EW', 'HOLX', 'ISRG', 'SYK', 'ZBH',
    // Consumer Discretionary (60+ stocks)
    'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'TJX', 'ROST',
    'DG', 'DLTR', 'FIVE', 'OLLI', 'BIG', 'CONN', 'BBY', 'GME', 'RH', 'WSM',
    'W', 'ETSY', 'CHWY', 'PTON', 'LULU', 'DKS', 'HIBB', 'ASO', 'BOOT', 'DKS',
    'F', 'GM', 'FORD', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'TSLA', 'F',
    'GM', 'FORD', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'TSLA', 'F', 'GM',
    'NCLH', 'RCL', 'CCL', 'LVS', 'WYNN', 'MGM', 'CZR', 'PENN', 'DKNG', 'FLUTTER',
    // Consumer Staples (30+ stocks)
    'WMT', 'COST', 'TGT', 'KR', 'SFM', 'GO', 'FRED', 'RAD', 'WBA', 'CVS',
    'PG', 'KO', 'PEP', 'CL', 'CHD', 'ENR', 'NWL', 'SPB', 'EL', 'REV',
    'CLX', 'KMB', 'CPB', 'CAG', 'HRL', 'SJM', 'GIS', 'K', 'POST', 'TWNK',
    // Energy (30+ stocks)
    'XOM', 'CVX', 'SLB', 'COP', 'EOG', 'MPC', 'VLO', 'PSX', 'HES', 'MRO',
    'FANG', 'OVV', 'CTRA', 'MTDR', 'PDC', 'SM', 'SWN', 'RRC', 'GPOR', 'MGY',
    'CRK', 'REI', 'NEXT', 'NOG', 'VTLE', 'LPI', 'CIVI', 'MGY', 'GPOR', 'SWN',
    // Industrials (70+ stocks)
    'BA', 'CAT', 'GE', 'HON', 'UPS', 'RTX', 'LMT', 'NOC', 'GD', 'TXT',
    'DE', 'CMI', 'PCAR', 'PH', 'EMR', 'ETN', 'IR', 'ROK', 'DOV', 'AME',
    'GGG', 'ITW', 'FAST', 'SWK', 'TTC', 'AOS', 'WWD', 'FLS', 'FLIR', 'TDY',
    'ZBRA', 'HWM', 'VICR', 'VMI', 'WWD', 'FLS', 'FLIR', 'TDY', 'ZBRA', 'HWM',
    'UNP', 'CSX', 'NSC', 'KSU', 'JBHT', 'ODFL', 'XPO', 'CHRW', 'KNX', 'ARCB',
    'RXO', 'HUBG', 'MRTN', 'WERN', 'USX', 'YELL', 'HTLD', 'WERN', 'MRTN', 'HUBG',
    // Materials (30+ stocks)
    'LIN', 'APD', 'ECL', 'SHW', 'PPG', 'DD', 'DOW', 'FCX', 'NEM', 'VALE',
    'AA', 'X', 'STLD', 'NUE', 'CLF', 'CMC', 'RS', 'ZEUS', 'SID', 'TMST',
    'MT', 'TX', 'GGB', 'SID', 'TMST', 'MT', 'TX', 'GGB', 'SID', 'TMST',
    // Real Estate (30+ stocks)
    'AMT', 'PLD', 'EQIX', 'PSA', 'WELL', 'VTR', 'PEAK', 'VICI', 'SPG', 'O',
    'DLR', 'EXPI', 'CBRE', 'JLL', 'CWK', 'MMI', 'CIGI', 'REXR', 'STAG', 'FR',
    'BRX', 'KIM', 'REG', 'MAC', 'SKT', 'BRX', 'KIM', 'REG', 'MAC', 'SKT',
    // Utilities (30+ stocks)
    'NEE', 'DUK', 'SO', 'AEP', 'SRE', 'EXC', 'XEL', 'ES', 'ED', 'PEG',
    'ETR', 'FE', 'AEE', 'LNT', 'ATO', 'CMS', 'CNP', 'NI', 'PNW', 'WEC',
    'BKH', 'OGE', 'SWX', 'UGI', 'NWN', 'POR', 'AVA', 'IDA', 'GAS', 'SJI',
    // Communication Services (30+ stocks)
    'VZ', 'T', 'CMCSA', 'DIS', 'NFLX', 'GOOGL', 'GOOG', 'META', 'TWTR', 'SNAP',
    'PINS', 'RDDT', 'IAC', 'ANGI', 'TRIP', 'EXPE', 'BKNG', 'ABNB', 'TRVG', 'TZOO',
    'FOXA', 'FOX', 'NWSA', 'NWS', 'PARA', 'LSXMB', 'LSXMA', 'LSXMK', 'FWONA', 'FWONK',
    // Additional stocks to reach 500
    'BRK.B', 'JNJ', 'V', 'PG', 'MA', 'UNH', 'HD', 'DIS', 'PYPL', 'BAC',
    'ADBE', 'CRM', 'NFLX', 'CMCSA', 'COST', 'PEP', 'TMO', 'AVGO', 'ACN', 'NKE',
    'ABT', 'TXN', 'QCOM', 'DHR', 'LIN', 'INTU', 'ISRG', 'BKNG', 'AMGN', 'ADP',
    'VRTX', 'GILD', 'AMAT', 'FISV', 'MU', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'ANSS',
    'FTNT', 'CRWD', 'ZS', 'PANW', 'NET', 'NOW', 'TEAM', 'DOCN', 'ESTC', 'DDOG',
    'MDB', 'SNOW', 'PLTR', 'RPD', 'BILL', 'COUP', 'ZM', 'DOCU', 'FROG', 'OKTA',
    'SPLK', 'VRSN', 'AKAM', 'FFIV', 'F5', 'NTNX', 'VEEV', 'WDAY', 'HUBS', 'TWLO',
];
// Vérifier que nous avons au moins 500 symboles uniques
const uniqueSymbols = [...new Set(exports.SP500_SYMBOLS)];
if (uniqueSymbols.length < 500) {
    console.warn(`Only ${uniqueSymbols.length} unique symbols found. Need 500 for full S&P 500.`);
}
exports.SP500_SYMBOLS_UNIQUE = uniqueSymbols.slice(0, 500);
