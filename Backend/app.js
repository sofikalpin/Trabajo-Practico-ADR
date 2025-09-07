const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Propiedad = require('./propiedad');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3000', 'http://20.121.65.197:3000', 'http://20.121.65.197', 'http://localhost'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log(`Carpeta 'uploads' creada en: ${uploadsDir}`);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)!'));
    },
    limits: { fileSize: 1024 * 1024 * 5 }
});

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/inmobiliaria';
mongoose.connect(dbURL)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

app.use('/api/auth', authRoutes);

app.use('/uploads', express.static(uploadsDir));

app.post('/propiedades', auth, upload.array('imagen', 20), async (req, res) => {
    try {
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
            disponible
        } = req.body;

        let imagenes = [];
        if (req.files && req.files.length > 0) {
            imagenes = req.files.map((file, index) => ({
                url: `/uploads/${file.filename}`,
                principal: index === 0
            }));
        }

        const propiedad = new Propiedad({
            titulo,
            descripcion,
            direccion,
            precio: {
                monto: parseFloat(precioMonto),
                moneda: precioMoneda
            },
            tipo,
            habitaciones: parseInt(habitaciones),
            banos: parseInt(banos),
            ambientes: parseInt(ambientes),
            metrosCuadrados: parseFloat(metrosCuadrados),
            transaccion: transaccion,
            disponible: disponible === 'true' || disponible === true,
            imagenes: imagenes,
        });

        await propiedad.save();
        res.status(201).json(propiedad);
    } catch (err) {
        console.error('Error al crear propiedad:', err);
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Error de subida de archivo: ${err.message}` });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ error: `Error de validación: ${messages.join(', ')}` });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear la propiedad.' });
    }
});


app.get('/propiedades', async (req, res) => {
    try {
        const propiedades = await Propiedad.find();
        res.json(propiedades);
    } catch (err) {
        console.error('Error al obtener propiedades:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener propiedades.' });
    }
});


app.get('/propiedades/:id', async (req, res) => {
    try {
        const propiedad = await Propiedad.findById(req.params.id);
        if (!propiedad) {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }
        res.json(propiedad);
    } catch (err) {
        console.error('Error al obtener propiedad por ID:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de propiedad inválido.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al obtener la propiedad.' });
    }
});


app.put('/propiedades/:id', auth, upload.array('imagen', 20), async (req, res) => {
    try {
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
            existingImages
        } = req.body;

        const updateData = {
            titulo,
            descripcion,
            direccion,
            precio: {
                monto: parseFloat(precioMonto),
                moneda: precioMoneda
            },
            tipo,
            habitaciones: parseInt(habitaciones),
            banos: parseInt(banos),
            ambientes: parseInt(ambientes),
            metrosCuadrados: parseFloat(metrosCuadrados),
            transaccion,
            disponible: disponible === 'true' || disponible === true,
        };

        let allCurrentImages = [];

        if (req.files && req.files.length > 0) {
            req.files.forEach((file, idx) => {
                allCurrentImages.push({ url: `/uploads/${file.filename}`, principal: false });
            });
        }

        if (existingImages && typeof existingImages === 'string' && existingImages.trim() !== '') {
            try {
                const parsedExistingImages = JSON.parse(existingImages);
                if (Array.isArray(parsedExistingImages)) {
                    allCurrentImages = allCurrentImages.concat(parsedExistingImages.map(img => ({
                        url: img.url,
                        principal: typeof img.principal === 'boolean' ? img.principal : false
                    })));
                }
            } catch (e) {

                allCurrentImages = allCurrentImages.concat(existingImages.split(',')
                    .map(imgUrl => imgUrl.trim())
                    .filter(imgUrl => imgUrl !== '')
                    .map(url => ({ url: url, principal: false })));
            }
        }

        if (allCurrentImages.length > 0 && !allCurrentImages.some(img => img.principal)) {
            allCurrentImages[0].principal = true;
        }

        updateData.imagenes = allCurrentImages;

        const propiedad = await Propiedad.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!propiedad) {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }
        res.json(propiedad);
    } catch (err) {
        console.error('Error al actualizar propiedad:', err);
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Error de subida de archivo: ${err.message}` });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de propiedad inválido.' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ error: `Error de validación: ${messages.join(', ')}` });
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar la propiedad.' });
    }
});


app.delete('/propiedades/:id', auth, async (req, res) => {
    try {
        const propiedad = await Propiedad.findByIdAndDelete(req.params.id);
        if (!propiedad) {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }

        if (propiedad.imagenes && propiedad.imagenes.length > 0) {
            propiedad.imagenes.forEach(image => {
                const filename = path.basename(image.url);
                const fullPath = path.join(uploadsDir, filename);
                fs.unlink(fullPath, (err) => {
                    if (err) {
                        console.error(`Error al eliminar el archivo de imagen ${fullPath}:`, err);
                    } else {
                        console.log(`Archivo de imagen eliminado: ${fullPath}`);
                    }
                });
            });
        }

        res.json({ mensaje: 'Propiedad eliminada exitosamente' });
    } catch (err) {
        console.error('Error al eliminar propiedad:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de propiedad inválido.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al eliminar la propiedad.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});