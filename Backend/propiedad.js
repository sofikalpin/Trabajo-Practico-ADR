const mongoose = require('mongoose');

const propiedadSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  direccion: {
    type: String,
    required: true,
    trim: true,
  },
  imagenes: [
    {
      url: { type: String, required: true },
      principal: { type: Boolean, default: false }
    }
  ],
  descripcion: {
    type: String,
    required: true,
    trim: true,
  },
  habitaciones: {
    type: Number,
    required: true,
    min: 0,
  },
  banos: {
    type: Number,
    required: true,
    min: 0,
  },
  ambientes: {
    type: Number,
    required: true,
    min: 0,
  },
  metrosCuadrados: {
    type: Number,
    required: true,
    min: 0,
  },
  tipo: {
    type: String,
    required: true,
    enum: ['Casa', 'Departamento', 'Oficina', 'Local Comercial', 'Terreno', 'Bodega', 'Penthouse', 'Duplex', 'Estudio', 'Nave Industrial'],
  },
  precio: {
    monto: { type: Number, required: true, min: 0 },
    moneda: { type: String, required: true, enum: ['USD', 'ARS'] }
  },
  transaccion: {
    type: String,
    required: true,
    enum: ['Venta', 'Alquiler', 'Alquiler Temporario'],
    default: 'Venta',
  },
  disponible: {
    type: Boolean,
    default: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Propiedad', propiedadSchema);