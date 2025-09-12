const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreta_desarrollo_key';
const DB_URL = process.env.MONGODB_URI || process.env.DB_URL;

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(DB_URL);
  await client.connect();
  cachedClient = client;
  return client;
}

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('inmobiliaria');
    const propiedades = db.collection('propiedades');

    switch (req.method) {
      case 'GET':
        // Listar propiedades con filtros
        const { tipo: tipoFiltro, transaccion: transaccionFiltro, disponible: disponibleFiltro, limit = 50, page = 1 } = req.query;
        
        const filtros = {};
        if (tipoFiltro) filtros.tipo = tipoFiltro;
        if (transaccionFiltro) filtros.transaccion = transaccionFiltro;
        if (disponibleFiltro !== undefined) filtros.disponible = disponibleFiltro === 'true';
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const propiedadesList = await propiedades
          .find(filtros)
          .sort({ fechaCreacion: -1 })
          .limit(parseInt(limit))
          .skip(skip)
          .toArray();
          
        const total = await propiedades.countDocuments(filtros);
        
        return res.status(200).json({
          success: true,
          data: propiedadesList,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        });

      case 'POST':
        // Crear nueva propiedad (requiere autenticación)
        const user = verifyToken(req);
        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Token de autenticación requerido'
          });
        }

        const {
          titulo,
          descripcion,
          direccion,
          precioMonto,
          precioMoneda,
          tipo,
          habitaciones,
          banos,
          ambientes,
          metrosCuadrados,
          transaccion,
          disponible,
          imagenes
        } = req.body;

        const nuevaPropiedad = {
          titulo: titulo?.trim(),
          descripcion: descripcion?.trim(),
          direccion: direccion?.trim(),
          precio: {
            monto: parseFloat(precioMonto) || 0,
            moneda: precioMoneda || 'ARS'
          },
          tipo,
          habitaciones: parseInt(habitaciones) || 0,
          banos: parseInt(banos) || 0,
          ambientes: parseInt(ambientes) || 0,
          metrosCuadrados: parseFloat(metrosCuadrados) || 0,
          transaccion,
          disponible: disponible === 'true' || disponible === true,
          imagenes: imagenes || [], // URLs de Cloudinary
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        };

        const resultado = await propiedades.insertOne(nuevaPropiedad);
        
        return res.status(201).json({
          success: true,
          message: 'Propiedad creada exitosamente',
          data: { ...nuevaPropiedad, _id: resultado.insertedId }
        });

      default:
        return res.status(405).json({
          success: false,
          error: 'Método no permitido'
        });
    }

  } catch (error) {
    console.error('Error en propiedades:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}
