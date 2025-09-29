import React, { useState } from 'react';
import axios from '../axiosConfig';
import { uploadMultipleImages } from '../utils/imageUpload';

const API_URL = '/propiedades';

function PropiedadFormCloudinary({ onSuccess, onCancel }) {
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
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, message: '' });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length > 20) {
            setError('Máximo 20 imágenes permitidas');
            return;
        }

        setImagenesArchivos(files);

        // Crear previews
        const previews = files.map(file => {
            const reader = new FileReader();
            return new Promise(resolve => {
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previews).then(setImagenesPreview);
    };

    const validateForm = () => {
        if (!formData.titulo.trim()) return 'El título es requerido.';
        if (!formData.descripcion.trim()) return 'La descripción es requerida.';
        if (!formData.direccion.trim()) return 'La dirección es requerida.';
        if (!formData.precioMonto || parseFloat(formData.precioMonto) <= 0) return 'El precio debe ser mayor a 0.';
        if (!formData.tipo) return 'El tipo de propiedad es requerido.';
        if (!formData.transaccion) return 'El tipo de transacción es requerido.';
        
        const habitaciones = parseInt(formData.habitaciones);
        if (isNaN(habitaciones) || habitaciones < 0) return 'El número de habitaciones debe ser válido.';
        
        const banos = parseInt(formData.banos);
        if (isNaN(banos) || banos < 0) return 'El número de baños debe ser válido.';
        
        const metrosCuadrados = parseFloat(formData.metrosCuadrados);
        if (isNaN(metrosCuadrados) || metrosCuadrados <= 0) return 'Los metros cuadrados deben ser válidos.';
        
        if (imagenesArchivos.length === 0) return 'Debes subir al menos una imagen.';
        
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

        try {
            // Subir imágenes a Cloudinary
            setIsUploadingImages(true);
            
            const { uploadedImages, errors } = await uploadMultipleImages(
                imagenesArchivos,
                null,
                (current, total, message) => {
                    setUploadProgress({ current, total, message });
                }
            );

            if (errors.length > 0) {
                console.warn('Errores al subir algunas imágenes:', errors);
            }

            setIsUploadingImages(false);

            // Crear la propiedad con las URLs de las imágenes
            const propiedadData = {
                ...formData,
                imagenes: uploadedImages
            };

            const response = await axios.post(API_URL, propiedadData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                console.log('Propiedad creada exitosamente:', response.data.data);
                onSuccess(response.data.data);
            } else {
                throw new Error(response.data.error || 'Error al crear la propiedad');
            }
        } catch (err) {
            console.error('Error al crear propiedad:', err);
            setError(err.response?.data?.error || err.message || 'Error al crear la propiedad');
        } finally {
            setIsSubmitting(false);
            setIsUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        const newFiles = imagenesArchivos.filter((_, i) => i !== index);
        const newPreviews = imagenesPreview.filter((_, i) => i !== index);
        setImagenesArchivos(newFiles);
        setImagenesPreview(newPreviews);
    };

    return (
        <div className="propiedad-form-overlay">
            <div className="propiedad-form-container">
                <div className="propiedad-form-header">
                    <h2>Nueva Propiedad</h2>
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={onCancel}
                        disabled={isSubmitting || isUploadingImages}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="propiedad-form">
                    {error && <div className="error-message">{error}</div>}
                    
                    {/* Progress indicator */}
                    {isUploadingImages && (
                        <div className="upload-progress">
                            <p>{uploadProgress.message}</p>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                ></div>
                            </div>
                            <span>{uploadProgress.current} de {uploadProgress.total}</span>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="titulo">Título *</label>
                            <input
                                type="text"
                                id="titulo"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción *</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                rows="4"
                                required
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="direccion">Dirección *</label>
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="precioMonto">Precio *</label>
                            <input
                                type="number"
                                id="precioMonto"
                                name="precioMonto"
                                value={formData.precioMonto}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                required
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="precioMoneda">Moneda</label>
                            <select
                                id="precioMoneda"
                                name="precioMoneda"
                                value={formData.precioMoneda}
                                onChange={handleInputChange}
                                disabled={isSubmitting || isUploadingImages}
                            >
                                <option value="USD">USD</option>
                                <option value="ARS">ARS</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tipo">Tipo *</label>
                            <select
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting || isUploadingImages}
                            >
                                <option value="">Seleccionar tipo</option>
                                <option value="Casa">Casa</option>
                                <option value="Departamento">Departamento</option>
                                <option value="Oficina">Oficina</option>
                                <option value="Local">Local</option>
                                <option value="Terreno">Terreno</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="transaccion">Transacción *</label>
                            <select
                                id="transaccion"
                                name="transaccion"
                                value={formData.transaccion}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting || isUploadingImages}
                            >
                                <option value="">Seleccionar transacción</option>
                                <option value="Venta">Venta</option>
                                <option value="Alquiler">Alquiler</option>
                                <option value="Alquiler Temporario">Alquiler Temporario</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="habitaciones">Habitaciones</label>
                            <input
                                type="number"
                                id="habitaciones"
                                name="habitaciones"
                                value={formData.habitaciones}
                                onChange={handleInputChange}
                                min="0"
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="banos">Baños</label>
                            <input
                                type="number"
                                id="banos"
                                name="banos"
                                value={formData.banos}
                                onChange={handleInputChange}
                                min="0"
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="ambientes">Ambientes</label>
                            <input
                                type="number"
                                id="ambientes"
                                name="ambientes"
                                value={formData.ambientes}
                                onChange={handleInputChange}
                                min="0"
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="metrosCuadrados">Metros Cuadrados *</label>
                            <input
                                type="number"
                                id="metrosCuadrados"
                                name="metrosCuadrados"
                                value={formData.metrosCuadrados}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                required
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="disponible"
                                    checked={formData.disponible}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting || isUploadingImages}
                                />
                                Disponible
                            </label>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="imagenes">Imágenes * (máximo 20)</label>
                            <input
                                type="file"
                                id="imagenes"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isSubmitting || isUploadingImages}
                            />
                        </div>
                    </div>

                    {imagenesPreview.length > 0 && (
                        <div className="imagenes-preview">
                            <h4>Vista previa de imágenes:</h4>
                            <div className="preview-grid">
                                {imagenesPreview.map((preview, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="btn-remove-image"
                                            onClick={() => removeImage(index)}
                                            disabled={isSubmitting || isUploadingImages}
                                        >
                                            ×
                                        </button>
                                        {index === 0 && <span className="principal-badge">Principal</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onCancel}
                            disabled={isSubmitting || isUploadingImages}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting || isUploadingImages}
                        >
                            {isUploadingImages ? 'Subiendo imágenes...' : isSubmitting ? 'Creando...' : 'Crear Propiedad'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PropiedadFormCloudinary;
