// Modelo de datos para propiedades inmobiliarias

const mongoose = require('mongoose');

// Esquema para imágenes de propiedades
const imagenSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: [true, 'La URL de la imagen es requerida'],
    trim: true
  },
  principal: { 
    type: Boolean, 
    default: false 
  }
}, { _id: false });

// Esquema principal de propiedades
const propiedadSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres'],
    minlength: [5, 'El título debe tener al menos 5 caracteres']
  },
  
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres']
  },
  
  direccion: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true,
    maxlength: [300, 'La dirección no puede exceder 300 caracteres']
  },
  
  tipo: {
    type: String,
    required: [true, 'El tipo de propiedad es requerido'],
    enum: {
      values: [
        'Casa', 'Departamento', 'Oficina', 'Local Comercial', 
        'Terreno', 'Bodega', 'Penthouse', 'Duplex', 
        'Estudio', 'Nave Industrial'
      ],
      message: 'Tipo de propiedad no válido'
    }
  },
  
  transaccion: {
    type: String,
    required: [true, 'El tipo de transacción es requerido'],
    enum: {
      values: ['Venta', 'Alquiler', 'Alquiler Temporario'],
      message: 'Tipo de transacción no válido'
    },
    default: 'Venta'
  },
  
  precio: {
    monto: { 
      type: Number, 
      required: [true, 'El monto del precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
      max: [999999999, 'El precio excede el límite máximo']
    },
    moneda: { 
      type: String, 
      required: [true, 'La moneda es requerida'],
      enum: {
        values: ['USD', 'ARS'],
        message: 'Moneda no válida (USD o ARS)'
      }
    }
  },
  
  habitaciones: {
    type: Number,
    required: [true, 'El número de habitaciones es requerido'],
    min: [0, 'El número de habitaciones no puede ser negativo'],
    max: [50, 'El número de habitaciones excede el límite máximo']
  },
  
  banos: {
    type: Number,
    required: [true, 'El número de baños es requerido'],
    min: [0, 'El número de baños no puede ser negativo'],
    max: [20, 'El número de baños excede el límite máximo']
  },
  
  ambientes: {
    type: Number,
    required: [true, 'El número de ambientes es requerido'],
    min: [0, 'El número de ambientes no puede ser negativo'],
    max: [100, 'El número de ambientes excede el límite máximo']
  },
  
  metrosCuadrados: {
    type: Number,
    required: [true, 'Los metros cuadrados son requeridos'],
    min: [1, 'Los metros cuadrados deben ser mayor a 0'],
    max: [100000, 'Los metros cuadrados exceden el límite máximo']
  },
  
  imagenes: {
    type: [imagenSchema],
    validate: {
      validator: function(imagenes) {
        return imagenes.length <= 20;
      },
      message: 'No se pueden subir más de 20 imágenes por propiedad'
    }
  },
  
  disponible: {
    type: Boolean,
    default: true
  },
  
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware pre-save para actualizar fechaActualizacion
propiedadSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

// Middleware pre-findOneAndUpdate para actualizar fechaActualizacion
propiedadSchema.pre('findOneAndUpdate', function(next) {
  this.set({ fechaActualizacion: new Date() });
  next();
});

// Virtual para obtener la imagen principal
propiedadSchema.virtual('imagenPrincipal').get(function() {
  if (this.imagenes && this.imagenes.length > 0) {
    const principal = this.imagenes.find(img => img.principal);
    return principal || this.imagenes[0];
  }
  return null;
});

// Método para formatear precio
propiedadSchema.methods.getPrecioFormateado = function() {
  const simbolo = this.precio.moneda === 'USD' ? 'US$' : '$';
  const monto = new Intl.NumberFormat('es-AR').format(this.precio.monto);
  return `${simbolo} ${monto}`;
};

// Índices para mejorar performance
propiedadSchema.index({ tipo: 1, transaccion: 1 });
propiedadSchema.index({ disponible: 1 });
propiedadSchema.index({ fechaCreacion: -1 });
propiedadSchema.index({ 'precio.monto': 1 });

module.exports = mongoose.model('Propiedad', propiedadSchema);