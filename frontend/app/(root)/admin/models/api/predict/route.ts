import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { company, days_ahead } = body;

    if (!company) {
      return NextResponse.json(
        { error: 'Company parameter required' },
        { status: 400 }
      );
    }

    // Use the Python API URL - try localhost first for local development
    const pythonApiUrl = process.env.PYTHON_API_URL || (process.env.NODE_ENV === 'production' ? 'http://prediction-api:8000' : 'http://localhost:8000');
    
    console.log(`[Predict Route] Calling ${pythonApiUrl}/api/predict for ${company}`);
    
    const response = await fetch(`${pythonApiUrl}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company,
        days_ahead: days_ahead || 10,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Predict Route] API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `API Error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Predict Route] Success: Got predictions for ${company}`);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[Predict Route] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get predictions', details: String(error) },
      { status: 500 }
    );
  }
}

// Support GET method as well (convert query params to body)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const company = searchParams.get('company');
    const days_ahead = searchParams.get('days_ahead') || '10';

    if (!company) {
      return NextResponse.json(
        { error: 'Company parameter required' },
        { status: 400 }
      );
    }

    // Call Python API via POST
    const pythonApiUrl = process.env.PYTHON_API_URL || (process.env.NODE_ENV === 'production' ? 'http://prediction-api:8000' : 'http://localhost:8000');
    
    const response = await fetch(`${pythonApiUrl}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company,
        days_ahead: parseInt(days_ahead),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Predict Route GET] API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `API Error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[Predict Route GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get predictions', details: String(error) },
      { status: 500 }
    );
  }
}

