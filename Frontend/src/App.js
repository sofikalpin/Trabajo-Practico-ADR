import React, { useState, useEffect } from 'react';
import PropiedadesList from './components/PropiedadesList';
import AuthForm from './components/AuthForm';
import ImageCarousel from './components/ImageCarousel.js';
import './App.css';
import logo from './imagenes/logo.png';

import carouselImage1 from './imagenes/imagen1.jpg';
import carouselImage2 from './imagenes/imagen2.jpg';
import carouselImage3 from './imagenes/imagen3.jpg';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    setCarouselImages([carouselImage1, carouselImage2, carouselImage3]);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthForm(false);
  };

  const handleAuthCancel = () => {
    setShowAuthForm(false);
    setIsRegistering(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    alert('Has cerrado sesión exitosamente.');
  };

  const handleOpenRegisterForm = () => {
    if (isAuthenticated) {
      setShowAuthForm(true);
      setIsRegistering(true);
    } else {
      alert('Para registrar nuevas cuentas, debes iniciar sesión como un usuario existente.');
      setShowAuthForm(true);
      setIsRegistering(false);
    }
  };

  return (
    <div className="App">
      <header>
        <img src={logo} alt="Logo de la Inmobiliaria" className="app-logo" />
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <button onClick={handleOpenRegisterForm} className="btn-register-new-user">
                Registrar Nuevo Usuario
              </button>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setShowAuthForm(true); setIsRegistering(false); }} className="btn-login primary-login-btn">
                Iniciar Sesión
              </button>
            </>
          )}
        </div>
      </header>
      <main>
        {carouselImages.length > 0 && <ImageCarousel images={carouselImages} />}
        <PropiedadesList
          isAuthenticated={isAuthenticated}
          setShowAuthForm={setShowAuthForm}
          setIsRegistering={setIsRegistering}
        />
      </main>

      {showAuthForm && (
        <AuthForm
          onAuthSuccess={handleAuthSuccess}
          onCancel={handleAuthCancel}
          isRegister={isRegistering}
        />
      )}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-title">
              <strong>MKalpin Negocios Inmobiliarios</strong>
            </div>
            <div className="footer-address">
              <i className="fas fa-map-marker-alt"></i>
              <span>Florida 142, Piso 8 Oficina "I",CABA, Argentina</span>
            </div>
            <div className="footer-contact">
              <i className="fas fa-phone-alt"></i>
              <a href="tel:1156690002">11 5669-0002</a>
            </div>
            <div className="footer-contact">
              <i className="fas fa-envelope"></i>
              <a href="mailto:mkalpinni@gmail.com">mkalpinni@gmail.com</a>
            </div>
          </div>
          <div className="footer-social">
            <span className="footer-social-title">Seguinos</span>
            <div className="footer-social-icons">
              <a href="https://www.facebook.com/profile.php?id=100063507733126" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/mkalpinni/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://api.whatsapp.com/message/L4HL64FWSL4UH1?autoload=1&app_absent=02" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} Inmobiliaria ADR. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default App;