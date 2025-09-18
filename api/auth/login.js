const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      error: 'Solo se permite POST para login'
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    const client = await connectToDatabase();
    const db = client.db('inmobiliaria');
    const users = db.collection('users');

    // Buscar usuario
    const user = await users.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};