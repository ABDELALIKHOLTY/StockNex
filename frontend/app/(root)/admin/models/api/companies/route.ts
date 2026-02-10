export async function GET() {
  try {
    // Get list of all companies with models
    // Use prediction-api service name in Docker, localhost:8000 otherwise
    const predictionApiUrl = process.env.NODE_ENV === 'production'
      ? 'http://prediction-api:8000'
      : 'http://localhost:8000';
    const companiesRes = await fetch(`${predictionApiUrl}/api/companies`);
    if (!companiesRes.ok) {
      throw new Error('Failed to fetch companies');
    }
    
    const companies: string[] = await companiesRes.json();
    console.log('Companies with models:', companies);

    // Get detailed models for each company
    const allModels = [];
    for (const company of companies) {
      try {
        const predictionApiUrl = process.env.NODE_ENV === 'production'
          ? 'http://prediction-api:8000'
          : 'http://localhost:8000';
        const modelRes = await fetch(`${predictionApiUrl}/api/models/${company}`);
        if (modelRes.ok) {
          const modelData = await modelRes.json();
          allModels.push(modelData);
          console.log(`Loaded models for ${company}:`, modelData);
        }
      } catch (err) {
        console.error(`Error loading models for ${company}:`, err);
      }
    }

    return new Response(JSON.stringify({ companies: allModels }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Backend error:', error);
    return new Response(JSON.stringify({ companies: [], error: 'Failed to fetch companies' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


