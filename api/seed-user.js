import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

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

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('inmobiliaria');
    const users = db.collection('users');

    // Verificar si ya existe el usuario
    const existingUser = await users.findOne({ email: 'admin@test.com' });
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'Usuario de prueba ya existe',
        user: {
          email: 'admin@test.com',
          password: '123456'
        }
      });
    }

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('123456', 10);
    const testUser = {
      email: 'admin@test.com',
      password: hashedPassword,
      nombre: 'Admin',
      apellido: 'Test',
      rol: 'admin',
      activo: true,
      fechaCreacion: new Date(),
      ultimoAcceso: new Date()
    };

    await users.insertOne(testUser);

    res.status(201).json({
      success: true,
      message: 'Usuario de prueba creado exitosamente',
      user: {
        email: 'admin@test.com',
        password: '123456'
      }
    });

  } catch (error) {
    console.error('Error creando usuario de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}