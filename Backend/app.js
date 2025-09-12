const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Propiedad = require('./propiedad');
const User = require('./models/user');
const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost',
        'http://20.121.65.197:3000',
        'http://20.121.65.197',
        'http://20.121.65.197:8080',
        'http://20.121.65.197:80'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Carpeta 'uploads' creada en: ${uploadsDir}`);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)')); // TODO: mejorar validación de archivos
    },
    limits: { 
        fileSize: 1024 * 1024 * 5,
        files: 20
    }
});

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/inmobiliaria';
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

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
            titulo: titulo?.trim(),
            descripcion: descripcion?.trim(),
            direccion: direccion?.trim(),
            precio: {
                monto: parseFloat(precioMonto) || 0,
                moneda: precioMoneda || 'ARS'
            },
            tipo,
            habitaciones: parseInt(habitaciones) || 0,
            banos: parseInt(banos) || 0,
            ambientes: parseInt(ambientes) || 0,
            metrosCuadrados: parseFloat(metrosCuadrados) || 0,
            transaccion,
            disponible: disponible === 'true' || disponible === true,
            imagenes
        });

        const propiedadGuardada = await propiedad.save();
        console.log(`Nueva propiedad creada: ${propiedadGuardada.titulo}`);
        
        res.status(201).json({
            success: true,
            message: 'Propiedad creada exitosamente',
            data: propiedadGuardada
        });
    } catch (err) {
        console.error('Error al crear propiedad:', err);
        
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ 
                success: false,
                error: `Error de subida de archivo: ${err.message}` 
            });
        }
        
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false,
                error: `Error de validación: ${messages.join(', ')}` 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor al crear la propiedad'
        });
    }
});


app.get('/propiedades', async (req, res) => {
    try {
        const { tipo, transaccion, disponible, limit = 50, page = 1 } = req.query;
        
        // Construir filtros dinámicamente
        const filtros = {};
        if (tipo) filtros.tipo = tipo;
        if (transaccion) filtros.transaccion = transaccion;
        if (disponible !== undefined) filtros.disponible = disponible === 'true';
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const propiedades = await Propiedad.find(filtros)
            .sort({ fechaCreacion: -1 })
            .limit(parseInt(limit))
            .skip(skip);
            
        const total = await Propiedad.countDocuments(filtros);
        
        res.json({
            success: true,
            data: propiedades,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error al obtener propiedades:', err);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor al obtener propiedades'
        });
    }
});


app.get('/propiedades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const propiedad = await Propiedad.findById(id);
        if (!propiedad) {
            return res.status(404).json({ 
                success: false,
                error: 'Propiedad no encontrada' 
            });
        }
        
        res.json({
            success: true,
            data: propiedad
        });
    } catch (err) {
        console.error('Error al obtener propiedad por ID:', err);
        
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                error: 'ID de propiedad inválido' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor al obtener la propiedad' 
        });
    }
});


app.put('/propiedades/:id', auth, upload.array('imagen', 20), async (req, res) => {
    try {
        const { id } = req.params;
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
            titulo: titulo?.trim(),
            descripcion: descripcion?.trim(),
            direccion: direccion?.trim(),
            precio: {
                monto: parseFloat(precioMonto) || 0,
                moneda: precioMoneda || 'ARS'
            },
            tipo,
            habitaciones: parseInt(habitaciones) || 0,
            banos: parseInt(banos) || 0,
            ambientes: parseInt(ambientes) || 0,
            metrosCuadrados: parseFloat(metrosCuadrados) || 0,
            transaccion,
            disponible: disponible === 'true' || disponible === true
        };

        let allCurrentImages = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                allCurrentImages.push({ 
                    url: `/uploads/${file.filename}`, 
                    principal: false 
                });
            });
        }

        if (existingImages && typeof existingImages === 'string' && existingImages.trim() !== '') {
            try {
                const parsedExistingImages = JSON.parse(existingImages);
                if (Array.isArray(parsedExistingImages)) {
                    allCurrentImages = allCurrentImages.concat(
                        parsedExistingImages.map(img => ({
                            url: img.url,
                            principal: typeof img.principal === 'boolean' ? img.principal : false
                        }))
                    );
                }
            } catch (e) {
                allCurrentImages = allCurrentImages.concat(
                    existingImages.split(',')
                        .map(imgUrl => imgUrl.trim())
                        .filter(imgUrl => imgUrl !== '')
                        .map(url => ({ url, principal: false }))
                );
            }
        }

        if (allCurrentImages.length > 0 && !allCurrentImages.some(img => img.principal)) {
            allCurrentImages[0].principal = true;
        }

        updateData.imagenes = allCurrentImages;

        const propiedad = await Propiedad.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!propiedad) {
            return res.status(404).json({ 
                success: false,
                error: 'Propiedad no encontrada' 
            });
        }

        console.log(`Propiedad actualizada: ${propiedad.titulo}`);
        
        res.json({
            success: true,
            message: 'Propiedad actualizada exitosamente',
            data: propiedad
        });
    } catch (err) {
        console.error('Error al actualizar propiedad:', err);
        
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ 
                success: false,
                error: `Error de subida de archivo: ${err.message}` 
            });
        }
        
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                error: 'ID de propiedad inválido' 
            });
        }
        
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false,
                error: `Error de validación: ${messages.join(', ')}` 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor al actualizar la propiedad' 
        });
    }
});


app.delete('/propiedades/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const propiedad = await Propiedad.findByIdAndDelete(id);
        if (!propiedad) {
            return res.status(404).json({ 
                success: false,
                error: 'Propiedad no encontrada' 
            });
        }

        // Limpiar archivos de imágenes del sistema de archivos
        if (propiedad.imagenes && propiedad.imagenes.length > 0) {
            const deletePromises = propiedad.imagenes.map(image => {
                return new Promise((resolve) => {
                    const filename = path.basename(image.url);
                    const fullPath = path.join(uploadsDir, filename);
                    
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            console.error(`Error al eliminar imagen ${fullPath}:`, err.message);
                        } else {
                            console.log(`Imagen eliminada: ${filename}`);
                        }
                        resolve();
                    });
                });
            });
            
            await Promise.all(deletePromises);
        }

        console.log(`Propiedad eliminada: ${propiedad.titulo}`);
        
        res.json({ 
            success: true,
            message: 'Propiedad eliminada exitosamente',
            data: { id: propiedad._id, titulo: propiedad.titulo }
        });
    } catch (err) {
        console.error('Error al eliminar propiedad:', err);
        
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                error: 'ID de propiedad inválido' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor al eliminar la propiedad' 
        });
    }
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API disponible en: http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado correctamente');
        mongoose.connection.close(false, () => {
            console.log('Conexión MongoDB cerrada');
            process.exit(0);
        });
    });
});

module.exports = app;