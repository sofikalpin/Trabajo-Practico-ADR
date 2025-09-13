import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const DB_URL = process.env.MONGODB_URI || process.env.DB_URL;

async function createTestUser() {
  try {
    const client = new MongoClient(DB_URL);
    await client.connect();
    const db = client.db('inmobiliaria');
    const users = db.collection('users');

    // Verificar si ya existe el usuario
    const existingUser = await users.findOne({ email: 'admin@test.com' });
    if (existingUser) {
      console.log('Usuario de prueba ya existe');
      await client.close();
      return;
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
    console.log('Usuario de prueba creado: admin@test.com / 123456');
    await client.close();
  } catch (error) {
    console.error('Error creando usuario de prueba:', error);
  }
}

createTestUser();