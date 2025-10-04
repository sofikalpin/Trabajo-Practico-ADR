import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import PropiedadForm from './PropiedadForm';
import PropiedadEditForm from './PropiedadEditForm';
import PropiedadDetail from './PropiedadDetail';

import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/propiedades`;

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
        return 'Consultar precio';
    }
    
    const montoFormateado = formatNumber(precio.monto);
    const simbolo = precio.moneda === 'USD' ? 'US$' : '$';
    
    return `${simbolo} ${montoFormateado}`;
};

function PropiedadesList({ isAuthenticated, setShowAuthForm, setIsRegistering }) {
    const [allPropiedades, setAllPropiedades] = useState([]);
    const [propiedades, setPropiedades] = useState([]);

    const [editingPropiedad, setEditingPropiedad] = useState(null);
    const [viewingPropiedad, setViewingPropiedad] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterTipo, setFilterTipo] = useState('');
    const [filterTransaccion, setFilterTransaccion] = useState('');

    const fetchAllPropiedades = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            setAllPropiedades(response.data);

        } catch (err) {
            console.error('Error al obtener propiedades:', err);
            setError('No se pudieron cargar las propiedades. Inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllPropiedades();
    }, [fetchAllPropiedades]);

    useEffect(() => {
        if (allPropiedades.length === 0 && !loading) return;

        let filtered = [...allPropiedades];

        if (filterTipo) {
            filtered = filtered.filter(prop => prop.tipo === filterTipo);
        }

        if (filterTransaccion) {
            filtered = filtered.filter(prop => prop.transaccion === filterTransaccion);
        }

        if (!isAuthenticated) {
            filtered = filtered.filter(prop => prop.disponible === true);
        }

        setPropiedades(filtered);
    }, [filterTipo, filterTransaccion, allPropiedades, loading, isAuthenticated]);

    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token && config.url.startsWith(`${window.location.origin}/api/`)) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    const handleDelete = async (id) => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para eliminar propiedades.');
            return;
        }
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
            return;
        }
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchAllPropiedades();
            alert('Propiedad eliminada con éxito.');
        } catch (err) {
            console.error('Error al eliminar propiedad:', err);
            if (err.response && err.response.status === 401) {
                alert('No autorizado. Tu sesión ha expirado o no tienes permisos para realizar esta acción. Por favor, inicia sesión de nuevo.');
                localStorage.removeItem('token');
                setShowAuthForm(true);
                setIsRegistering(false);
            } else {
                alert('Hubo un error al eliminar la propiedad. Por favor, inténtalo de nuevo.');
            }
        }
    };

    const handleEdit = (propiedad) => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para editar propiedades.');
            return;
        }
        setEditingPropiedad(propiedad);
        setShowEditForm(true);
        setShowCreateForm(false);
        setViewingPropiedad(null);
    };

    const handleAddNew = () => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para agregar propiedades.');
            return;
        }
        setEditingPropiedad(null);
        setShowCreateForm(true);
        setShowEditForm(false);
        setViewingPropiedad(null);
    };

    const handleView = (propiedad) => {
        setViewingPropiedad(propiedad);
        setShowCreateForm(false);
        setShowEditForm(false);
    };

    const handleCloseView = () => {
        setViewingPropiedad(null);
    };

    const handleFormSuccess = () => {
        setEditingPropiedad(null);
        setShowCreateForm(false);
        setShowEditForm(false);
        setViewingPropiedad(null);
        fetchAllPropiedades();
    };

    const handleFormCancel = () => {
        setEditingPropiedad(null);
        setShowCreateForm(false);
        setShowEditForm(false);
    };

    const tiposPropiedad = [
        'Casa', 'Departamento', 'Oficina', 'Local Comercial',
        'Terreno', 'Bodega', 'Penthouse', 'Duplex', 'Estudio', 'Nave Industrial'
    ];
    const tiposTransaccion = ['Venta', 'Alquiler', 'Alquiler Temporario'];

    const handleClearFilters = () => {
        setFilterTipo('');
        setFilterTransaccion('');
    };

    return (
        <div className="propiedades-list-container">
            <div className="list-header">
                <h2>Nuestras Propiedades</h2>
                {isAuthenticated && (
                    <button onClick={handleAddNew} className="btn-add-new">
                        Agregar Nueva Propiedad
                    </button>
                )}
            </div>

            <div className="filter-section">
                <div className="filter-group">
                    <label htmlFor="filterTipo">Filtrar por Tipo:</label>
                    <select
                        id="filterTipo"
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                        className="form-select"
                    >
                        <option value="">Todos los Tipos</option>
                        {tiposPropiedad.map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="filterTransaccion">Filtrar por Transacción:</label>
                    <select
                        id="filterTransaccion"
                        value={filterTransaccion}
                        onChange={(e) => setFilterTransaccion(e.target.value)}
                        className="form-select"
                    >
                        <option value="">Todas las Transacciones</option>
                        {tiposTransaccion.map((transaccion) => (
                            <option key={transaccion} value={transaccion}>{transaccion}</option>
                        ))}
                    </select>
                </div>

                <button onClick={handleClearFilters} className="btn-secondary">
                    Limpiar Filtros
                </button>
            </div>

            {showCreateForm && isAuthenticated && (
                <PropiedadForm
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

            {showEditForm && editingPropiedad && isAuthenticated && (
                <PropiedadEditForm
                    propiedad={editingPropiedad}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

            {viewingPropiedad && (
                <PropiedadDetail
                    propiedad={viewingPropiedad}
                    onClose={handleCloseView}
                    isAuthenticated={isAuthenticated}
                />
            )}

            {loading && <p className="loading-message">Cargando propiedades...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && propiedades.length === 0 && !showCreateForm && !showEditForm && !viewingPropiedad && (
                <p className="no-propiedades-message">No hay propiedades disponibles con los filtros actuales. {isAuthenticated ? '¡Intenta agregar una nueva o limpiar los filtros!' : 'Inicia sesión para gestionar propiedades.'}</p>
            )}

            {!loading && !error && propiedades.length > 0 && !showCreateForm && !showEditForm && !viewingPropiedad && (
                <ul className="propiedades-grid">
                    {propiedades.map((propiedad) => (
                        <li
                            key={propiedad._id}
                            className="propiedad-card"
                            onClick={() => handleView(propiedad)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-image-container">
                                {propiedad.imagenes && propiedad.imagenes.length > 0 && propiedad.imagenes[0].url ? (
                                    <img
                                        src={propiedad.imagenes[0].url.startsWith('http') ? propiedad.imagenes[0].url : `${API_BASE_URL}${propiedad.imagenes[0].url}`}
                                        alt={propiedad.titulo}
                                        className="propiedad-image"
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/400x250?text=Imagen+No+Disponible" }}
                                    />
                                ) : (
                                    <img
                                        src="https://via.placeholder.com/400x250?text=Imagen+No+Disponible"
                                        alt="No disponible"
                                        className="propiedad-image"
                                    />
                                )}
                            </div>
                            <div className="card-content">
                                <h3 className="card-title">{propiedad.titulo}</h3>
                                
                                <div className="card-price">
                                    <span className="price-label">Precio:</span>
                                    <span className="price-value">{formatPrice(propiedad.precio)}</span>
                                </div>
                                
                                <div className="card-details">
                                    <p className="card-detail">
                                        <strong>Transacción:</strong> 
                                        <span className="detail-value">{propiedad.transaccion || 'N/A'}</span>
                                    </p>
                                    <p className="card-detail">
                                        <strong>Tipo:</strong> 
                                        <span className="detail-value">{propiedad.tipo || 'N/A'}</span>
                                    </p>
                                    <p className="card-detail">
                                        <strong>Dirección:</strong> 
                                        <span className="detail-value">{propiedad.direccion || 'N/A'}</span>
                                    </p>
                                    <p className="card-detail">
                                        <strong>Habitaciones:</strong> 
                                        <span className="detail-value">{formatNumber(propiedad.habitaciones)}</span>
                                         | 
                                        <strong>Baños:</strong> 
                                        <span className="detail-value">{formatNumber(propiedad.banos)}</span>
                                    </p>
                                    <p className="card-detail">
                                        <strong>Ambientes:</strong> 
                                        <span className="detail-value">{formatNumber(propiedad.ambientes) || 'N/A'}</span>
                                    </p>
                                    <p className="card-detail">
                                        <strong>Superficie:</strong> 
                                        <span className="detail-value">{formatNumber(propiedad.metrosCuadrados)} m²</span>
                                    </p>
                                </div>
                                
                                {isAuthenticated && (
                                    <p className={`card-availability ${propiedad.disponible ? 'available' : 'not-available'}`}>
                                        <strong>Estado:</strong> {propiedad.disponible ? 'Disponible' : 'No Disponible'}
                                    </p>
                                )}
                                {isAuthenticated && (
                                    <div className="propiedad-actions" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleEdit(propiedad)} className="btn-edit">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(propiedad._id)} className="btn-delete">
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default PropiedadesList;