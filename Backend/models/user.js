/**
 * Modelo de Usuario - Sistema Inmobiliario MKalpin
 * 
 * Define el esquema de datos para usuarios del sistema
 * con autenticación y validaciones de seguridad.
 * 
 * @author Sofia Kalpin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, 'El email no puede exceder 100 caracteres'],
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Por favor, introduce una dirección de correo electrónico válida'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    maxlength: [128, 'La contraseña no puede exceder 128 caracteres']
  },
  
  nombre: {
    type: String,
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  
  apellido: {
    type: String,
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  
  rol: {
    type: String,
    enum: {
      values: ['admin', 'agente', 'usuario'],
      message: 'Rol no válido'
    },
    default: 'usuario'
  },
  
  activo: {
    type: Boolean,
    default: true
  },
  
  ultimoAcceso: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password; // No incluir password en JSON
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Middleware pre-save para hashear contraseña
UserSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12); // Aumentar rounds para mayor seguridad
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pre-save para actualizar updatedAt
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Error al verificar contraseña');
  }
};

// Método para actualizar último acceso
UserSchema.methods.updateLastAccess = async function() {
  this.ultimoAcceso = new Date();
  return await this.save();
};

// Virtual para nombre completo
UserSchema.virtual('nombreCompleto').get(function() {
  if (this.nombre && this.apellido) {
    return `${this.nombre} ${this.apellido}`;
  }
  return this.email;
});

// Índices para mejorar performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ activo: 1 });
UserSchema.index({ rol: 1 });

module.exports = mongoose.model('User', UserSchema);