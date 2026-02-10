import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, days_ahead } = body;

    if (!company) {
      return NextResponse.json(
        { detail: 'Company symbol is required' },
        { status: 400 }
      );
    }

    // Normalize company symbol to lowercase
    const normalizedCompany = company.toLowerCase();

    console.log(`Requesting prediction for ${normalizedCompany} with ${days_ahead} days ahead`);

    // Forward the request to the Python backend
    // Dans Docker: utilise le nom du service. Sinon: localhost:8000
    const predictionApiUrl = process.env.NODE_ENV === 'production'
      ? 'http://prediction-api:8000/api/predict'
      : 'http://localhost:8000/api/predict';
    
    const response = await fetch(predictionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company: normalizedCompany,
        days_ahead: days_ahead || 10,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { detail: data.detail || 'Failed to get predictions' },
        { status: response.status }
      );
    }

    console.log('Prediction successful');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { detail: `Error: ${error instanceof Error ? error.message : 'Failed to fetch predictions. Make sure the backend is running.'}` },
      { status: 500 }
    );
  }
}
