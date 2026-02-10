export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company');

  if (!company) {
    return new Response(JSON.stringify({ error: 'Company parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Use prediction-api service name in Docker, localhost:8000 otherwise
    const predictionApiUrl = process.env.NODE_ENV === 'production'
      ? 'http://prediction-api:8000'
      : 'http://localhost:8000';
    
    const response = await fetch(`${predictionApiUrl}/api/models/${company}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Backend error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete models' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
