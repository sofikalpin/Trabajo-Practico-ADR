// Health check endpoint
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'API Inmobiliaria MKalpin funcionando correctamente',
      timestamp: new Date().toISOString(),
      endpoints: {
        propiedades: '/api/propiedades',
        auth: '/api/auth/login',
        health: '/api/health'
      }
    });
  }

  return res.status(405).json({
    success: false,
    error: 'Método no permitido'
  });
}