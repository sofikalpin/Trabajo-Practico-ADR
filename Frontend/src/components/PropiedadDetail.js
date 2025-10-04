import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const formatNumber = (number) => {
    if (number === null || number === undefined || isNaN(number)) {
        return 'N/A';
    }
    
    const num = typeof number === 'string' ? parseFloat(number) : number;
    
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
};

const formatPrice = (precio) => {
    if (!precio || !precio.monto) {
        return 'Precio a consultar';
    }
    
    const montoFormateado = formatNumber(precio.monto);
    const simbolo = precio.moneda === 'USD' ? 'US$' : '$';
    
    return `${simbolo} ${montoFormateado} ${precio.moneda}`;
};

function PropiedadDetail({ propiedad, onClose, isAuthenticated }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [propiedad]);

    if (!propiedad) {
        return null;
    }

    const imageUrl = propiedad.imagenes && propiedad.imagenes.length > 0
        ? (propiedad.imagenes[currentImageIndex].url.startsWith('http') 
            ? propiedad.imagenes[currentImageIndex].url 
            : `${API_BASE_URL}${propiedad.imagenes[currentImageIndex].url}`)
        : "https://via.placeholder.com/400x300?text=No+Image";

    const goToNextImage = () => {
        if (propiedad.imagenes && propiedad.imagenes.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % propiedad.imagenes.length
            );
        }
    };

    const goToPreviousImage = () => {
        if (propiedad.imagenes && propiedad.imagenes.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex - 1 + propiedad.imagenes.length) % propiedad.imagenes.length
            );
        }
    };

    return (
        <div className="propiedad-detail-modal">
            <div className="propiedad-detail-content">
                <h2>{propiedad.titulo}</h2>

                <div className="image-gallery-container">
                    <img
                        src={imageUrl}
                        alt={propiedad.titulo}
                        className="propiedad-detail-main-image"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/400x300?text=No+Image" }}
                    />
                    {propiedad.imagenes && propiedad.imagenes.length > 1 && (
                        <div className="gallery-controls">
                            <button onClick={goToPreviousImage} className="gallery-nav-button prev">
                                &lt;
                            </button>
                            <button onClick={goToNextImage} className="gallery-nav-button next">
                                &gt;
                            </button>
                            <div className="image-counter">
                                {currentImageIndex + 1} / {propiedad.imagenes.length}
                            </div>
                        </div>
                    )}
                </div>


                <div className="detail-info">
                    <div className="info-section">
                        <h4>Información General</h4>
                        <p><strong>Transacción:</strong> <span className="info-value">{propiedad.transaccion || 'N/A'}</span></p>
                        <p><strong>Tipo de Propiedad:</strong> <span className="info-value">{propiedad.tipo || 'N/A'}</span></p>
                        <p><strong>Dirección:</strong> <span className="info-value">{propiedad.direccion || 'N/A'}</span></p>
                        {isAuthenticated && (
                            <p><strong>Disponibilidad:</strong> <span className={`info-value ${propiedad.disponible ? 'available' : 'not-available'}`}>{propiedad.disponible ? 'Disponible' : 'No Disponible'}</span></p>
                        )}
                    </div>

                    <div className="info-section">
                        <h4>Características</h4>
                        <p><strong>Habitaciones:</strong> <span className="info-value">{formatNumber(propiedad.habitaciones)}</span></p>
                        <p><strong>Baños:</strong> <span className="info-value">{formatNumber(propiedad.banos)}</span></p>
                        <p><strong>Ambientes:</strong> <span className="info-value">{formatNumber(propiedad.ambientes) || 'N/A'}</span></p>
                        <p><strong>Metros Cuadrados:</strong> <span className="info-value">{formatNumber(propiedad.metrosCuadrados)} m²</span></p>
                    </div>

                    <div className="info-section price-section">
                        <h4>Precio</h4>
                        <p className="price-display">
                            <strong>{formatPrice(propiedad.precio)}</strong>
                        </p>
                    </div>

                    <div className="info-section description-section">
                        <h4>Descripción</h4>
                        <div className="description-content">
                            <p>{propiedad.descripcion || 'Sin descripción disponible.'}</p>
                        </div>
                    </div>
                </div>

                {propiedad.imagenes && propiedad.imagenes.length > 1 && (
                    <div className="detail-thumbnails">
                        <h4>Miniaturas:</h4>
                        <div className="thumbnail-container">
                            {propiedad.imagenes.map((imageObj, index) => (
                                <img
                                    key={index}
                                    src={imageObj.url.startsWith('http') ? imageObj.url : `${API_BASE_URL}${imageObj.url}`}
                                    alt={`${propiedad.titulo} ${index + 1}`}
                                    className={`propiedad-detail-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/100x75?text=No+Image" }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={onClose} className="btn-close-detail">
                    Cerrar
                </button>
            </div>
        </div>
    );
}

export default PropiedadDetail;