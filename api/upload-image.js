const { v2: cloudinary } = require('cloudinary');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreta_desarrollo_key';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticación requerido'
      });
    }

    const { image, propiedadId } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Imagen requerida'
      });
    }

    // Subir imagen a Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: `inmobiliaria/${propiedadId || 'temp'}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { format: 'webp' }
      ]
    });

    return res.status(200).json({
      success: true,
      data: {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        width: uploadResponse.width,
        height: uploadResponse.height
      }
    });

  } catch (error) {
    console.error('Error al subir imagen:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al subir imagen'
    });
  }
}
