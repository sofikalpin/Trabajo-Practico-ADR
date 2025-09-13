import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

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

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID de propiedad requerido'
      });
    }

    // Validar ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de propiedad inválido'
      });
    }

    switch (req.method) {
      case 'GET':
        // Obtener propiedad por ID
        const propiedad = await propiedades.findOne({ _id: new ObjectId(id) });
        
        if (!propiedad) {
          return res.status(404).json({
            success: false,
            error: 'Propiedad no encontrada'
          });
        }

        return res.status(200).json({
          success: true,
          data: propiedad
        });

      case 'PUT':
        // Actualizar propiedad (requiere autenticación)
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

        const updateData = {
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
          imagenes: imagenes || [],
          fechaActualizacion: new Date()
        };

        const resultado = await propiedades.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );

        if (!resultado) {
          return res.status(404).json({
            success: false,
            error: 'Propiedad no encontrada'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Propiedad actualizada exitosamente',
          data: resultado
        });

      case 'DELETE':
        // Eliminar propiedad (requiere autenticación)
        const userDelete = verifyToken(req);
        if (!userDelete) {
          return res.status(401).json({
            success: false,
            error: 'Token de autenticación requerido'
          });
        }

        const propiedadEliminada = await propiedades.findOneAndDelete({ _id: new ObjectId(id) });

        if (!propiedadEliminada) {
          return res.status(404).json({
            success: false,
            error: 'Propiedad no encontrada'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Propiedad eliminada exitosamente',
          data: { id: propiedadEliminada._id, titulo: propiedadEliminada.titulo }
        });

      default:
        return res.status(405).json({
          success: false,
          error: 'Método no permitido'
        });
    }

  } catch (error) {
    console.error('Error en propiedad individual:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}