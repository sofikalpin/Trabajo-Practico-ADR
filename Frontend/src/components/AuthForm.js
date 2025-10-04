import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';
import API_BASE_URL from '../config';

const API_AUTH_URL = `${API_BASE_URL}/api/auth`;

function AuthForm({ onAuthSuccess, onCancel, isRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? 'register' : 'login';
    const successMessage = isRegister ? 'Registro de usuario exitoso' : 'Inicio de sesión exitoso';

    try {
      const response = await axios.post(`${API_AUTH_URL}/${endpoint}`, { email, password });
      if (!isRegister) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        onAuthSuccess();
      } else {
        alert(successMessage);
        onCancel();
      }
    } catch (err) {
      console.error(`Error al ${isRegister ? 'registrar' : 'iniciar sesión'}:`, err.response?.data?.msg || err.message);
      let errorMessage = err.response?.data?.msg || 'Error al procesar tu solicitud. Inténtalo de nuevo.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.join(', ');
      }
      if (err.response && err.response.status === 401 && isRegister) {
          errorMessage = 'No autorizado para registrar usuarios. Por favor, asegúrate de haber iniciado sesión como administrador.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-overlay">
      <div className="auth-form-card">
        <h3>{isRegister ? 'Registrar Nuevo Usuario' : 'Iniciar Sesión'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Cargando...' : (isRegister ? 'Registrar' : 'Iniciar Sesión')}
            </button>
            <button type="button" onClick={onCancel} disabled={loading} className="btn-cancel">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthForm;