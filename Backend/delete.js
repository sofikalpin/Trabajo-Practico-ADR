const mongoose = require('mongoose');
const Propiedad = require('./propiedad');
require('dotenv').config();

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/inmobiliaria';

mongoose.connect(dbURL)
    .then(async () => {
        console.log('Conectado a MongoDB...');
        try {
            const result = await Propiedad.deleteMany({});
            console.log(`Se eliminaron ${result.deletedCount} propiedades de la base de datos.`);



        } catch (error) {
            console.error('Error al eliminar propiedades:', error);
        } finally {
            mongoose.disconnect();
            console.log('Desconectado de MongoDB.');
        }
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB:', err);
        process.exit(1);
    });