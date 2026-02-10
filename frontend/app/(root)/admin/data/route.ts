import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data - replace with actual database queries
    const dataSources = [
      {
        id: 'yahoo-finance',
        name: 'Yahoo Finance',
        type: 'Stock Market',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        recordCount: 500,
        status: 'active' as const,
        dataQuality: 98,
      },
      {
        id: 'news-api',
        name: 'News API',
        type: 'News Feed',
        lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        recordCount: 45230,
        status: 'active' as const,
        dataQuality: 92,
      },
      {
        id: 'crypto-data',
        name: 'Crypto Data',
        type: 'Cryptocurrency',
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        recordCount: 2500,
        status: 'syncing' as const,
        dataQuality: 87,
      },
      {
        id: 'historical-data',
        name: 'Historical Data',
        type: 'Time Series',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        recordCount: 125000,
        status: 'active' as const,
        dataQuality: 95,
      },
    ];

    return NextResponse.json(dataSources);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    );
  }
}
