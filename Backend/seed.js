const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');

const DB_URI = 'mongodb://localhost:27017/inmobiliaria';

mongoose.connect(DB_URI)
.then(async () => {
    console.log('Conectado a MongoDB para seeding de usuarios');

    await User.deleteMany({});
    console.log('Colección Usuarios limpiada.');

    const usersData = [
        {
            email: 'admin@inmobiliaria.com',
            password: 'adminpassword',
        },
        {
            email: 'usuario@inmobiliaria.com',
            password: 'userpassword',
        },
    ];

    const usersWithHashedPasswords = await Promise.all(usersData.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
    }));

    await User.insertMany(usersWithHashedPasswords);
    console.log('Datos de usuarios insertados exitosamente.');

    mongoose.disconnect();
    console.log('Desconectado de MongoDB');
})
.catch(err => {
    console.error('Error durante el seeding de la base de datos:', err);
    mongoose.disconnect();
});