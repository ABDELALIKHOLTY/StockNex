export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { company, lookback_period, n_trials, days_ahead } = body;

    if (!company) {
      return new Response(JSON.stringify({ error: 'Company parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use prediction-api service name in Docker, localhost:8000 otherwise
    const predictionApiUrl = process.env.NODE_ENV === 'production'
      ? 'http://prediction-api:8000'
      : 'http://localhost:8000';
    
    const response = await fetch(`${predictionApiUrl}/api/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company,
        lookback_period,
        n_trials,
        days_ahead,
      }),
    });

    const data = await response.json();

    // If Python API returns an error, forward it with better message
    if (!response.ok) {
      const errorDetail = data?.detail || data?.error || response.statusText;
      console.error('Python API error:', errorDetail);
      return new Response(JSON.stringify({ 
        error: `Python API error: ${errorDetail}`,
        detail: errorDetail 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Backend error:', error);
    return new Response(JSON.stringify({ 
      error: `Internal server error: ${errorMessage}`,
      detail: errorMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
