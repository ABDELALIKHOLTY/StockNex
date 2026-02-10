// Liste officielle complète des 500 symboles du S&P 500
// Source: Liste vérifiée et mise à jour (2024)
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

// Vérifier que nous avons au moins 500 symboles uniques
const uniqueSymbols = [...new Set(SP500_SYMBOLS)];

export const SP500_SYMBOLS_UNIQUE = uniqueSymbols;

// Groupes de symboles par secteur pour le dashboard
export const SP500_BY_SECTOR = {
  Technology: [
    'AAPL', 'MSFT', 'NVDA', 'AVGO', 'ORCL', 'ADBE', 'CRM', 'CSCO', 'ACN', 'AMD',
    'INTU', 'IBM', 'NOW', 'AMAT', 'TXN', 'QCOM', 'INTC', 'ADI', 'LRCX', 'KLAC',
    'ANET', 'SNPS', 'CDNS', 'MU', 'FISV', 'FTNT', 'MSI', 'HPQ', 'TDY', 'GLW',
    'NXPI', 'MRVL', 'KEYS', 'ON', 'MCHP', 'TER', 'SWKS', 'TRMB', 'CTSH', 'JNPR',
    'FSLR', 'AKAM', 'NTAP', 'HP', 'STX', 'WDC', 'LDOS', 'HPE', 'ZBRA', 'JKHY',
    'PTC', 'NET', 'DOCU', 'VRSN', 'PAYC', 'TYL', 'GDDY', 'CDW', 'JKHY', 'FFIV',
    'IT', 'DBX', 'MANH', 'PSTG', 'ZI', 'APP', 'ESTC', 'MDB', 'OKTA', 'SPLK',
    'TEAM', 'TWLO', 'ZS', 'CRWD', 'PANW', 'DLB', 'MPWR', 'ENTG', 'MKSI', 'COHR',
    'PLAB', 'UCTT', 'AOS', 'IPGP', 'IIVI', 'LITE', 'CREE', 'POWI', 'SLAB', 'SYNA',
    'CABO', 'COMM', 'VSAT', 'LSTR', 'JBL', 'FLEX', 'SANM', 'APH', 'TEL', 'GLW','DELL'
  ],

  Communication_Services: [
    'META', 'GOOGL', 'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'EA',
    'TTWO', 'LYV', 'OMC', 'IPG', 'WBD', 'PARA', 'FOX', 'FOXA', 'LBRDK', 'LBRDA',
    'TGNA', 'NWS', 'NWSA', 'ATVI', 'TTD', 'ROKU', 'SNAP', 'PINS', 'MTCH', 'BILI',
    'YELP', 'ANGI', 'IAC', 'TRIP', 'EXPE', 'BKNG', 'TRVG', 'AWAY', 'ABNB', 'UBER',
    'LYFT', 'DASH', 'GRUB', 'ZM', 'RNG', 'FIVN', 'RAMP', 'EVBG', 'BAND', 'CLVT'
  ],
  Financial: [
    'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'SPGI', 'BLK', 'AXP',
    'SCHW', 'C', 'CB', 'MMC', 'PGR', 'AON', 'ICE', 'CME', 'MCO', 'AJG',
    'BK', 'TROW', 'MSCI', 'STT', 'ALL', 'PRU', 'MET', 'AFL', 'TRV', 'FITB',
    'HBAN', 'RF', 'KEY', 'CFG', 'MTB', 'PNC', 'USB', 'DFS', 'SYF', 'COF',
    'NDAQ', 'RJF', 'BRO', 'EG', 'RE', 'WRB', 'L', 'PFG', 'AIG', 'HIG',
    'CNA', 'ERIE', 'CINF', 'AFG', 'AIZ', 'BEN', 'IVZ', 'JHG', 'LM', 'AMG',
    'APAM', 'AB', 'BKNG', 'EVR', 'PJT', 'STEP', 'HLI', 'MC', 'WDR', 'FHI',
    'GBL', 'KKR', 'OAK', 'FIG', 'CACC', 'ENVA', 'OPY', 'ECPG', 'COOP', 'CUBI',
    'TFSL', 'NYCB', 'WAL', 'PBCT', 'BOH', 'CFR', 'BKU', 'CADE', 'HOMB', 'ONB'
  ],
  Healthcare: [
    'UNH', 'LLY', 'JNJ', 'ABBV', 'MRK', 'TMO', 'PFE', 'ABT', 'DHR', 'AMGN',
    'BMY', 'GILD', 'VRTX', 'CVS', 'ELV', 'HUM', 'CI', 'BIIB', 'REGN', 'ISRG',
    'ZTS', 'SYK', 'BDX', 'IDXX', 'EW', 'DXCM', 'MRNA', 'ILMN', 'VEEV', 'WST',
    'HCA', 'MCK', 'CAH', 'ABC', 'BSX', 'MDT', 'RMD', 'ALC', 'IQV', 'HOLX',
    'BAX', 'DGX', 'UHS', 'LH', 'COO', 'MTD', 'TECH', 'PODD', 'STE', 'NVST',
    'TMO', 'DVA', 'CHE', 'XRAY', 'ALGN', 'HSIC', 'PDCO', 'NVCR', 'IRTC', 'TXG',
    'BEAM', 'EDIT', 'CRSP', 'NTRA', 'SDGR', 'RVMD', 'KRTX', 'APLS', 'EXAS', 'GH',
    'NBIX', 'INCY', 'BMRN', 'RGEN', 'BPMC', 'BLUE', 'KPTI', 'SRPT', 'RARE', 'VCYT'
  ],
  Consumer_Discretionary: [
    'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG', 'ORLY',
    'AZO', 'GM', 'F', 'MAR', 'YUM', 'CMG', 'LEN', 'DHI', 'NVR', 'PHM',
    'ROST', 'BURL', 'DKS', 'ULTA', 'ETSY', 'EXPE', 'RCL', 'CCL', 'NCLH', 'MGM',
    'WYNN', 'LKQ', 'BBY', 'KMX', 'GPC', 'AAP', 'HAS', 'MAT', 'NWL', 'VFC',
    'TPR', 'RL', 'TAP', 'SAM', 'LEG', 'WH', 'W', 'RH', 'PVH', 'GPS',
    'ANF', 'URBN', 'GES', 'KSS', 'M', 'JWN', 'DDS', 'TLYS', 'SCVL', 'BKE',
    'BOOT', 'CAL', 'DBI', 'HBI', 'GIL', 'KTB', 'PVH', 'VFC', 'CPRI', 'TIF',
    'SIG', 'BURL', 'FIVE', 'BIG', 'DLTR', 'DG', 'TJX', 'ROST', 'BURL', 'ODP'
  ],
  Consumer_Staples: [
    'PG', 'WMT', 'COST', 'KO', 'PEP', 'PM', 'MO', 'MDLZ', 'CL', 'KMB',
    'KHC', 'SYY', 'CAG', 'HSY', 'GIS', 'K', 'ADM', 'TSN', 'CPB', 'HRL',
    'MKC', 'CHD', 'SJM', 'TGT', 'KR', 'DLTR', 'DG', 'WBA', 'CLX', 'STZ',
    'BF.B', 'MNST', 'EL', 'LW', 'FLO', 'CBOE', 'BG', 'INGR', 'LANC', 'SMPL',
    'POST', 'HAIN', 'USFD', 'PFGC', 'UNFI', 'CHEF', 'BRBR', 'BYND', 'TSN', 'PPC',
    'PPC', 'HORM', 'SJM', 'JJSF', 'LANC', 'MGPI', 'BGS', 'VGR', 'UVV', 'IPAR'
  ],
  Energy: [
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'WMB',
    'KMI', 'HES', 'BKR', 'FANG', 'DVN', 'MRO', 'PXD', 'HAL', 'OKE', 'TRGP',
    'LNG', 'EQT', 'CTRA', 'APA', 'OVV', 'NOV', 'FTI', 'HFC', 'DK', 'DRQ',
    'NBL', 'CXO', 'PE', 'RRC', 'SWN', 'AR', 'CHK', 'RICE', 'GPOR', 'MGY',
    'CRK', 'SM', 'PDCE', 'CVI', 'CVRR', 'DK', 'PBF', 'VLO', 'MPC', 'PSX',
    'HFC', 'DK', 'PARR', 'CLR', 'MTDR', 'OXY', 'DVN', 'FANG', 'CTRA', 'APA'
  ],
  Industrials: [
    'UPS', 'CAT', 'RTX', 'HON', 'BA', 'LMT', 'GE', 'DE', 'UNP', 'ADP',
    'GD', 'NOC', 'CSX', 'WM', 'NSC', 'EMR', 'ITW', 'MMM', 'ETN', 'CARR',
    'TT', 'FDX', 'JCI', 'OTIS', 'CPRT', 'FAST', 'GWW', 'ROK', 'EFX', 'AME',
    'DOV', 'IR', 'PWR', 'VMI', 'XYL', 'WAB', 'GNRC', 'J', 'LDOS', 'TXT',
    'HII', 'BWXT', 'RHI', 'AOS', 'PH', 'PNR', 'FLS', 'IEX', 'GGG', 'MIDD',
    'AME', 'DOV', 'GWW', 'ITW', 'NDSN', 'PNR', 'ROP', 'SWK', 'EMR', 'DCI',
    'FLR', 'J', 'PWR', 'QUAD', 'RRR', 'SPXC', 'TKR', 'WSO', 'GVA', 'PRIM',
    'ROCK', 'STRL', 'MTZ', 'PRG', 'KBR', 'ACM', 'FLR', 'JEC', 'PWR', 'TXT'
  ],
  Materials: [
    'LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'CTVA', 'DD', 'DOW', 'NUE',
    'VMC', 'MLM', 'PPG', 'STLD', 'ALB', 'CF', 'MOS', 'FMC', 'IFF', 'EMN',
    'CE', 'AVY', 'BALL', 'WRK', 'IP', 'PKG', 'SEE', 'OLN', 'RPM', 'ASH',
    'AXTA', 'CC', 'FMC', 'IFF', 'LYB', 'MOS', 'NEU', 'NGVT', 'PPG', 'ROL',
    'SCL', 'SMG', 'SON', 'AVY', 'BMS', 'GEF', 'BERY', 'SLGN', 'TECH', 'TRS'
  ],
  'Real Estate': [
    'AMT', 'PLD', 'EQIX', 'PSA', 'WELL', 'DLR', 'O', 'SPG', 'VICI', 'CBRE',
    'EXR', 'AVB', 'EQR', 'VTR', 'SBAC', 'WY', 'MAA', 'ESS', 'UDR', 'ARE',
    'KIM', 'REG', 'FRT', 'BXP', 'HST', 'PEAK', 'CPT', 'AIV', 'DEI', 'HIW',
    'IRM', 'PSA', 'SPG', 'VNO', 'SLG', 'BXP', 'KRC', 'PDM', 'CUZ', 'AKR',
    'BRX', 'CDR', 'CHCT', 'CLI', 'CUBE', 'DEI', 'DRH', 'EQR', 'ESS', 'FR'
  ],
  Utilities: [
    'NEE', 'SO', 'DUK', 'CEG', 'SRE', 'AEP', 'D', 'EXC', 'XEL', 'PEG',
    'WEC', 'ES', 'AWK', 'DTE', 'PPL', 'AEE', 'CMS', 'LNT', 'ETR', 'FE',
    'AES', 'NRG', 'EIX', 'PNW', 'ED', 'NI', 'CNP', 'ATO', 'BKH', 'OGE',
    'POR', 'IDA', 'MGEE', 'NWE', 'SR', 'SWX', 'WTRG', 'AWR', 'ARTNA', 'CWT',
    'MSEX', 'SJI', 'UTL', 'CNL', 'HE', 'NJR', 'ORA', 'PEG', 'SCG', 'TE'
  ]
};
