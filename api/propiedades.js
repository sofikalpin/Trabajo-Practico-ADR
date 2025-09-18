const { MongoClient } = require('mongodb');

const DB_URL = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb+srv://utnsofi_db_user:h2I5bAxwmAkWVA8G@mkalpin.s4trunq.mongodb.net/inmobiliaria?retryWrites=true&w=majority';
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  if (!DB_URL) {
    throw new Error('No se encontró MONGODB_URI en las variables de entorno');
  }
  
  const client = new MongoClient(DB_URL);
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🚀 Función propiedades ejecutándose');
    console.log('📍 URL completa:', req.url);
    console.log('🔧 Método:', req.method);
    console.log('🌍 Variables de entorno disponibles:', {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasDbUrl: !!process.env.DB_URL,
      nodeEnv: process.env.NODE_ENV
    });

    // Conectar a la base de datos
    const client = await connectToDatabase();
    const db = client.db('inmobiliaria');
    const propiedades = db.collection('propiedades');

    if (req.method === 'GET') {
      console.log('📊 Buscando propiedades en la base de datos...');
      const propiedadesList = await propiedades
        .find({})
        .sort({ fechaCreacion: -1 })
        .limit(50)
        .toArray();
      
      const total = await propiedades.countDocuments({});
      console.log(`📈 Encontradas ${total} propiedades en la base de datos`);
      
      if (propiedadesList.length === 0) {
        console.log('⚠️ Base de datos vacía, devolviendo datos de prueba');
        return res.status(200).json({
          success: true,
          message: 'Base de datos vacía - mostrando datos de prueba',
          data: [
            {
              _id: 'test-1',
              titulo: 'Casa de prueba (DB vacía)',
              descripcion: 'La base de datos está vacía, esta es una propiedad de prueba',
              precio: { monto: 200000, moneda: 'USD' },
              tipo: 'Casa',
              direccion: 'Base de datos vacía 123',
              habitaciones: 4,
              banos: 3,
              ambientes: 6,
              metrosCuadrados: 200,
              transaccion: 'Venta',
              disponible: true,
              imagenes: [],
              fechaCreacion: new Date()
            }
          ],
          pagination: {
            page: 1,
            limit: 50,
            total: 1,
            pages: 1
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: propiedadesList,
        pagination: {
          page: 1,
          limit: 50,
          total,
          pages: Math.ceil(total / 50)
        }
      });
    }

    if (req.method === 'POST') {
      console.log('📝 Creando nueva propiedad');
      const propiedadData = req.body;
      
      // Agregar metadatos
      propiedadData.fechaCreacion = new Date();
      propiedadData.fechaActualizacion = new Date();
      
      const result = await propiedades.insertOne(propiedadData);
      
      return res.status(201).json({
        success: true,
        message: 'Propiedad creada exitosamente',
        data: { _id: result.insertedId, ...propiedadData }
      });
    }

    // Para PUT y DELETE, necesitamos extraer el ID de la URL
    const urlParts = req.url.split('/');
    const propiedadId = urlParts[urlParts.length - 1];

    if (req.method === 'PUT') {
      console.log('✏️ Actualizando propiedad:', propiedadId);
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(propiedadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de propiedad inválido'
        });
      }

      const updateData = req.body;
      updateData.fechaActualizacion = new Date();
      
      const result = await propiedades.updateOne(
        { _id: new ObjectId(propiedadId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Propiedad no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Propiedad actualizada exitosamente'
      });
    }

    if (req.method === 'DELETE') {
      console.log('🗑️ Eliminando propiedad:', propiedadId);
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(propiedadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de propiedad inválido'
        });
      }

      const result = await propiedades.deleteOne({ _id: new ObjectId(propiedadId) });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Propiedad no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Propiedad eliminada exitosamente'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Método no permitido'
    });

  } catch (error) {
    console.error('❌ Error general:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};