module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Solo se permite POST para subir imágenes'
    });
  }

  try {
    console.log('📸 Función upload-image ejecutándose');
    console.log('📍 URL completa:', req.url);
    console.log('🔧 Método:', req.method);

    // Por ahora, devolver una respuesta de prueba
    // En un entorno real, aquí integrarías con Cloudinary u otro servicio
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó imagen'
      });
    }

    // Simular subida exitosa
    return res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente (simulado)',
      url: 'https://via.placeholder.com/400x300?text=Imagen+Subida',
      public_id: 'simulated_' + Date.now()
    });

  } catch (error) {
    console.error('❌ Error en upload-image:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};
