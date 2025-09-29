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

// Configuración de middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost',
    'http://20.121.65.197:3000',
    'http://20.121.65.197',
    'http://20.121.65.197:8080',
    'http://20.121.65.197:80',
    'https://tudominio.com',
    'https://*.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin.includes('*')) {
                return origin.endsWith(allowedOrigin.substring(allowedOrigin.indexOf('*') + 1));
            }
            return origin === allowedOrigin;
        })) {
            return callback(null, true);
        }
        const msg = 'El origen no está permitido por CORS';
        return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Configuración de Multer para subida de archivos
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
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    },
    limits: { 
        fileSize: 1024 * 1024 * 5, // 5MB
        files: 20
    }
});

// Conexión a MongoDB
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/inmobiliaria';
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
});

// Configuración de rutas
const router = express.Router();

// Ruta de salud
router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Ruta para obtener propiedades
router.get('/propiedades', async (req, res) => {
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

// Ruta para obtener una propiedad por ID
router.get('/propiedades/:id', async (req, res) => {
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

// Ruta para crear una nueva propiedad
router.post('/propiedades', auth, upload.array('imagen', 20), async (req, res) => {
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
                url: `/api/uploads/${file.filename}`,
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

// Ruta para actualizar una propiedad
router.put('/propiedades/:id', auth, upload.array('imagen', 20), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (updates.precioMonto) {
            updates.precio = {
                monto: parseFloat(updates.precioMonto),
                moneda: updates.precioMoneda || 'ARS'
            };
            delete updates.precioMonto;
            delete updates.precioMoneda;
        }
        
        // Procesar nuevas imágenes si se suben
        if (req.files && req.files.length > 0) {
            const nuevasImagenes = req.files.map((file, index) => ({
                url: `/api/uploads/${file.filename}`,
                principal: index === 0 && !updates.imagenes
            }));
            
            updates.$push = { imagenes: { $each: nuevasImagenes } };
        }
        
        const propiedadActualizada = await Propiedad.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );
        
        if (!propiedadActualizada) {
            return res.status(404).json({
                success: false,
                error: 'Propiedad no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Propiedad actualizada exitosamente',
            data: propiedadActualizada
        });
    } catch (err) {
        console.error('Error al actualizar propiedad:', err);
        
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

// Ruta para eliminar una propiedad
router.delete('/propiedades/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const propiedad = await Propiedad.findByIdAndDelete(id);
        
        if (!propiedad) {
            return res.status(404).json({
                success: false,
                error: 'Propiedad no encontrada'
            });
        }
        
        // Opcional: Eliminar imágenes asociadas
        if (propiedad.imagenes && propiedad.imagenes.length > 0) {
            propiedad.imagenes.forEach(imagen => {
                const imagePath = path.join(__dirname, '..', 'uploads', path.basename(imagen.url));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }
        
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

// Usar el router con el prefijo /api
app.use('/api', router);

// Servir archivos estáticos
app.use('/api/uploads', express.static(uploadsDir));

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Manejo de señales de terminación
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

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API disponible en: http://localhost:${PORT}/api`);
});

module.exports = app;
