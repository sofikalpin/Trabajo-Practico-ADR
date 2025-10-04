import React, { useState, useEffect } from 'react';
import axios from 'axios';

import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/propiedades`;

function PropiedadForm({ onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        direccion: '',
        precioMonto: '',
        precioMoneda: 'USD',
        tipo: '',
        transaccion: '',
        habitaciones: '',
        banos: '',
        ambientes: '',
        metrosCuadrados: '',
        disponible: true,
    });
    const [imagenesArchivos, setImagenesArchivos] = useState([]);
    const [imagenesPreview, setImagenesPreview] = useState([]);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData({
            titulo: '', descripcion: '', direccion: '', precioMonto: '', precioMoneda: 'USD', tipo: '', transaccion: '',
            habitaciones: '', banos: '', ambientes: '', metrosCuadrados: '', disponible: true,
        });
        setImagenesArchivos([]);
        setImagenesPreview([]);
        setError(null);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (error) setError(null);
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setImagenesArchivos(files);
        setImagenesPreview(files.map(file => URL.createObjectURL(file)));
        setError(null);
    };

    const validateForm = () => {
        const requiredFields = ['titulo', 'descripcion', 'direccion', 'precioMonto', 'precioMoneda', 'tipo', 'transaccion', 'habitaciones', 'banos', 'ambientes', 'metrosCuadrados'];
        for (let field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                return `El campo "${field}" es requerido.`;
            }
        }

        const precio = parseFloat(formData.precioMonto);
        if (isNaN(precio) || precio <= 0) {
            return 'El precio debe ser un número válido mayor a 0.';
        }

        const habitaciones = parseInt(formData.habitaciones);
        if (isNaN(habitaciones) || habitaciones < 0) {
            return 'El número de habitaciones debe ser un número entero no negativo.';
        }

        const banos = parseInt(formData.banos);
        if (isNaN(banos) || banos < 0) {
            return 'El número de baños debe ser un número entero no negativo.';
        }

        const ambientes = parseInt(formData.ambientes);
        if (isNaN(ambientes) || ambientes < 0) {
            return 'El número de ambientes debe ser un número entero no negativo.';
        }

        const metrosCuadrados = parseFloat(formData.metrosCuadrados);
        if (isNaN(metrosCuadrados) || metrosCuadrados <= 0) {
            return 'Los metros cuadrados deben ser un número válido mayor a 0.';
        }

        if (imagenesArchivos.length === 0) {
            return 'Debes subir al menos una imagen para la nueva propiedad.';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);

        const formDataToSend = new FormData();
        formDataToSend.append('titulo', formData.titulo);
        formDataToSend.append('descripcion', formData.descripcion);
        formDataToSend.append('direccion', formData.direccion);
        formDataToSend.append('precioMonto', parseFloat(formData.precioMonto));
        formDataToSend.append('precioMoneda', formData.precioMoneda);
        formDataToSend.append('tipo', formData.tipo);
        formDataToSend.append('transaccion', formData.transaccion);
        formDataToSend.append('habitaciones', parseInt(formData.habitaciones));
        formDataToSend.append('banos', parseInt(formData.banos));
        formDataToSend.append('ambientes', parseInt(formData.ambientes));
        formDataToSend.append('metrosCuadrados', parseFloat(formData.metrosCuadrados));
        formDataToSend.append('disponible', formData.disponible);

        imagenesArchivos.forEach(file => {
            formDataToSend.append('imagen', file);
        });

        try {
            await axios.post(API_URL, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onSuccess();
        } catch (err) {
            console.error('Error al enviar el formulario (frontend):', err.response ? err.response.data : err.message);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const tiposPropiedad = [
        'Casa', 'Departamento', 'Oficina', 'Local Comercial',
        'Terreno', 'Bodega', 'Penthouse', 'Duplex', 'Estudio', 'Nave Industrial'
    ];

    const tiposTransaccion = ['Venta', 'Alquiler', 'Alquiler Temporario'];
    const monedas = ['USD', 'ARS'];

    return (
        <div className="propiedad-form-container">
            <div className="form-header">
                <h3 className="form-title">Nueva Propiedad</h3>
                <p className="form-subtitle">Completa la información para registrar una nueva propiedad.</p>
            </div>

            {error && (
                <div className="error-message">
                    <div className="error-icon">⚠</div>
                    <div className="error-text">{error}</div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="propiedad-form">
                <div className="form-grid">
                    <div className="form-section">
                        <h4 className="section-title">Información Básica</h4>
                        <div className="form-field">
                            <label className="form-label">Título <span className="required-indicator">*</span></label>
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Ej: Casa moderna en zona residencial"
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Descripción <span className="required-indicator">*</span></label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                className="form-textarea"
                                placeholder="Describe las características principales de la propiedad..."
                                rows={4}
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Dirección <span className="required-indicator">*</span></label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Ej: Av. Principal 123, Colonia Centro"
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Tipo de Propiedad <span className="required-indicator">*</span></label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="">Seleccionar tipo</option>
                                {tiposPropiedad.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Tipo de Transacción <span className="required-indicator">*</span></label>
                            <select
                                name="transaccion"
                                value={formData.transaccion}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="">Seleccionar transacción</option>
                                {tiposTransaccion.map(transaccion => (
                                    <option key={transaccion} value={transaccion}>{transaccion}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4 className="section-title">Detalles Numéricos</h4>
                        <div className="form-field">
                            <label className="form-label">Precio <span className="required-indicator">*</span></label>
                            <input
                                type="number"
                                name="precioMonto"
                                value={formData.precioMonto}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Moneda <span className="required-indicator">*</span></label>
                            <select
                                name="precioMoneda"
                                value={formData.precioMoneda}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                {monedas.map(moneda => (
                                    <option key={moneda} value={moneda}>{moneda}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-field half-width">
                                <label className="form-label">Habitaciones <span className="required-indicator">*</span></label>
                                <input
                                    type="number"
                                    name="habitaciones"
                                    value={formData.habitaciones}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div className="form-field half-width">
                                <label className="form-label">Baños <span className="required-indicator">*</span></label>
                                <input
                                    type="number"
                                    name="banos"
                                    value={formData.banos}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Ambientes <span className="required-indicator">*</span></label>
                            <input
                                type="number"
                                name="ambientes"
                                value={formData.ambientes}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Metros Cuadrados <span className="required-indicator">*</span></label>
                            <input
                                type="number"
                                name="metrosCuadrados"
                                value={formData.metrosCuadrados}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="checkbox-field">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="disponible"
                                    checked={formData.disponible}
                                    onChange={handleChange}
                                    className="checkbox-input"
                                />
                                <span className="checkbox-text">Propiedad Disponible</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-section full-width">
                    <h4 className="section-title">Imágenes de la Propiedad</h4>
                    <div className="form-field">
                        <label className="form-label">Seleccionar Imágenes <span className="required-indicator">*</span></label>
                        <input
                            type="file"
                            name="imagen"
                            accept="image/*"
                            multiple
                            onChange={handleImagesChange}
                            required
                            className="form-input-file"
                        />
                        {imagenesPreview.length > 0 && (
                            <div className="image-preview-container">
                                <p>Previsualización:</p>
                                <div className="thumbnails-grid">
                                    {imagenesPreview.map((src, index) => (
                                        <img key={index} src={src} alt={`Previsualización ${index}`} className="image-preview-thumbnail" />
                                    ))}
                                </div>
                            </div>
                        )}
                        <p className="field-hint">Sube una o más imágenes para la nueva propiedad (requerido).</p>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading-spinner"></span>
                                Guardando...
                            </>
                        ) : (
                            'Guardar Propiedad'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PropiedadForm;