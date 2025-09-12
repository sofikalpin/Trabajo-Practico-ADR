// Script para crear usuarios iniciales en la base de datos

const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

// Configuración de base de datos
const DB_URI = process.env.DB_URL || 'mongodb://localhost:27017/inmobiliaria';

// Datos de usuarios iniciales
const initialUsers = [
    {
        email: 'admin@inmobiliaria.com',
        password: 'adminpassword',
        nombre: 'Administrador',
        apellido: 'Sistema',
        rol: 'admin'
    },
    {
        email: 'agente@inmobiliaria.com',
        password: 'agentepassword',
        nombre: 'Agente',
        apellido: 'Inmobiliario',
        rol: 'agente'
    },
    {
        email: 'usuario@inmobiliaria.com',
        password: 'userpassword',
        nombre: 'Usuario',
        apellido: 'Prueba',
        rol: 'usuario'
    }
];

/**
 * Función principal de seeding
 */
async function seedDatabase() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado a MongoDB para inicialización');

        // Limpiar colección de usuarios existentes
        const deleteResult = await User.deleteMany({});
        console.log(`${deleteResult.deletedCount} usuarios eliminados`);

        // Crear usuarios iniciales
        console.log('Creando usuarios iniciales...');
        
        for (const userData of initialUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`Usuario creado: ${user.email} (${user.rol})`);
        }

        console.log('Inicialización de base de datos completada exitosamente');
        
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        process.exit(1);
    } finally {
        // Desconectar de MongoDB
        await mongoose.disconnect();
        console.log('Desconectado de MongoDB');
        process.exit(0);
    }
}

/**
 * Función para mostrar ayuda
 */
function showHelp() {
    console.log(`
📋 Script de Inicialización de Base de Datos

Uso: node seed.js [opciones]

Opciones:
  --help, -h    Mostrar esta ayuda
  
Este script creará los siguientes usuarios:
  - admin@inmobiliaria.com (Administrador)
  - agente@inmobiliaria.com (Agente)
  - usuario@inmobiliaria.com (Usuario)

⚠️  ADVERTENCIA: Este script eliminará todos los usuarios existentes.
    `);
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Ejecutar seeding
        console.log('Iniciando proceso de inicialización de base de datos...');
seedDatabase();