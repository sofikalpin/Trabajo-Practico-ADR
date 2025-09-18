const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const DB_URL = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb+srv://utnsofi_db_user:h2I5bAxwmAkWVA8G@mkalpin.s4trunq.mongodb.net/inmobiliaria?retryWrites=true&w=majority';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecreta_desarrollo_key';

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

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Solo se permite GET para obtener perfil'
    });
  }

  try {
    const user = verifyToken(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticación requerido'
      });
    }

    const client = await connectToDatabase();
    const db = client.db('inmobiliaria');
    const users = db.collection('users');

    const userData = await users.findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { password: 0 } }
    );

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt
      }
    });

  } catch (error) {
    console.error('Error en me:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};