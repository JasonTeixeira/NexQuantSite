// Demo API endpoint to test BYOK integration
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Test connection to BYOK backend
    try {
      const response = await fetch('http://localhost:3011/health');
      const data = await response.json();
      
      res.status(200).json({
        status: 'success',
        message: 'BYOK API backend is running',
        backend: data,
        endpoints: {
          health: 'http://localhost:3011/health',
          security: 'http://localhost:3011/api/byok/security-status',
          platform_data: 'http://localhost:3011/api/byok/platform-inventory',
          validate_key: 'http://localhost:3011/api/byok/validate-key',
          create_session: 'http://localhost:3011/api/byok/create-session'
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'BYOK API backend not responding',
        error: error.message
      });
    }
  } else if (req.method === 'POST') {
    // Test API key validation
    const { provider, api_key, secret_key } = req.body;
    
    try {
      const response = await fetch('http://localhost:3011/api/byok/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key, secret_key })
      });
      
      const result = await response.json();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'API key validation failed',
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
