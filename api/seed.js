const { MongoClient } = require('mongodb');

const DB_URL = 'mongodb+srv://utnsofi_db_user:h2I5bAxwmAkWVA8G@mkalpin.s4trunq.mongodb.net/inmobiliaria?retryWrites=true&w=majority';

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Solo se permite POST o GET para seed'
    });
  }

  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    const client = new MongoClient(DB_URL);
    await client.connect();
    console.log('✅ Conectado a MongoDB para seed');
    
    const db = client.db('inmobiliaria');
    const propiedades = db.collection('propiedades');
    
    // Limpiar colección existente
    await propiedades.deleteMany({});
    console.log('🧹 Colección limpiada');
    
    // Datos de prueba
    const propiedadesPrueba = [
      {
        titulo: 'Casa moderna en el centro',
        descripcion: 'Hermosa casa de 3 plantas con jardín y garage',
        direccion: 'Av. Libertador 1234, Capital Federal',
        precio: {
          monto: 350000,
          moneda: 'USD'
        },
        tipo: 'Casa',
        habitaciones: 4,
        banos: 3,
        ambientes: 7,
        metrosCuadrados: 250,
        transaccion: 'Venta',
        disponible: true,
        imagenes: [],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        titulo: 'Departamento con vista al río',
        descripcion: 'Departamento de 2 ambientes con balcón y vista panorámica',
        direccion: 'Puerto Madero 567, CABA',
        precio: {
          monto: 180000,
          moneda: 'USD'
        },
        tipo: 'Departamento',
        habitaciones: 2,
        banos: 1,
        ambientes: 3,
        metrosCuadrados: 85,
        transaccion: 'Venta',
        disponible: true,
        imagenes: [],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        titulo: 'Local comercial en zona céntrica',
        descripcion: 'Local comercial ideal para oficina o comercio',
        direccion: 'Corrientes 890, Centro',
        precio: {
          monto: 2500,
          moneda: 'USD'
        },
        tipo: 'Local Comercial',
        habitaciones: 0,
        banos: 1,
        ambientes: 2,
        metrosCuadrados: 60,
        transaccion: 'Alquiler',
        disponible: true,
        imagenes: [],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    ];
    
    // Insertar datos
    const resultado = await propiedades.insertMany(propiedadesPrueba);
    console.log(`✅ Insertadas ${resultado.insertedCount} propiedades`);
    
    await client.close();
    
    return res.status(200).json({
      success: true,
      message: `Base de datos inicializada con ${resultado.insertedCount} propiedades`,
      insertedCount: resultado.insertedCount,
      data: propiedadesPrueba
    });
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al inicializar la base de datos',
      details: error.message
    });
  }
};