/**
 * Rutas de Autenticación - Sistema Inmobiliario MKalpin
 * 
 * Maneja el registro e inicio de sesión de usuarios
 * con validaciones de seguridad y generación de JWT.
 * 
 * @author Sofia Kalpin
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');
require('dotenv').config();

// Configuración JWT
const jwtSecret = process.env.JWT_SECRET || 'supersecreta';
const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

/**
 * POST /api/auth/register
 * Registrar nuevo usuario (requiere autenticación de admin)
 */
router.post('/register', auth, async (req, res) => {
  try {
    const { email, password, nombre, apellido, rol } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: 'Email y contraseña son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        msg: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        msg: 'Ya existe un usuario con este email' 
      });
    }

    // Crear nuevo usuario
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      nombre: nombre?.trim(),
      apellido: apellido?.trim(),
      rol: rol || 'usuario'
    });

    await user.save();

    console.log(`✅ Nuevo usuario registrado: ${user.email}`);

    res.status(201).json({ 
      success: true,
      msg: 'Usuario registrado exitosamente', 
      data: { 
        id: user._id, 
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      } 
    });

  } catch (err) {
    console.error('❌ Error en registro:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false,
        msg: 'Error de validación',
        errors: messages 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false,
        msg: 'El email ya está registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      msg: 'Error interno del servidor' 
    });
  }
});

/**
 * POST /api/auth/login
 * Iniciar sesión de usuario
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      activo: true 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        msg: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        msg: 'Credenciales inválidas' 
      });
    }

    // Actualizar último acceso
    await user.updateLastAccess();

    // Crear payload del token
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        rol: user.rol
      }
    };

    // Generar token JWT
    const token = jwt.sign(payload, jwtSecret, { expiresIn });

    console.log(`✅ Inicio de sesión exitoso: ${user.email}`);

    res.json({ 
      success: true,
      msg: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        nombreCompleto: user.nombreCompleto
      }
    });

  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Error interno del servidor' 
    });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('❌ Error al obtener usuario:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Error interno del servidor' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión (invalidar token del lado cliente)
 */
router.post('/logout', auth, (req, res) => {
  // En una implementación real, podrías mantener una blacklist de tokens
  console.log(`🚪 Usuario ${req.user.id} cerró sesión`);
  
  res.json({ 
    success: true,
    msg: 'Sesión cerrada exitosamente' 
  });
});

module.exports = router;