import React, { useState, useEffect } from 'react';
import PropiedadesList from './components/PropiedadesList';
import AuthForm from './components/AuthForm';
import ImageCarousel from './components/ImageCarousel';
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
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initializeApp = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsAuthenticated(true);
        }
        setCarouselImages([carouselImage1, carouselImage2, carouselImage3]);
      } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthForm(false);
        console.log('Autenticación exitosa');
  };

  const handleAuthCancel = () => {
    setShowAuthForm(false);
    setIsRegistering(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      console.log('Sesión cerrada');
      alert('Has cerrado sesión exitosamente.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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

  const handleOpenLoginForm = () => {
    setShowAuthForm(true);
    setIsRegistering(false);
  };

  if (loading) {
    return (
      <div className="App loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <img 
            src={logo} 
            alt="Logo MKalpin Negocios Inmobiliarios" 
            className="app-logo" 
          />
          
          <nav className="auth-navigation">
            {isAuthenticated ? (
              <div className="auth-buttons authenticated">
                <button 
                  onClick={handleOpenRegisterForm} 
                  className="btn-register-new-user"
                  title="Registrar nuevo usuario"
                >
                  Registrar Nuevo Usuario
                </button>
                <button 
                  onClick={handleLogout} 
                  className="btn-logout"
                  title="Cerrar sesión"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="auth-buttons guest">
                <button 
                  onClick={handleOpenLoginForm} 
                  className="btn-login primary-login-btn"
                  title="Iniciar sesión"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {carouselImages.length > 0 && (
          <section className="carousel-section">
            <ImageCarousel images={carouselImages} />
          </section>
        )}

        <section className="properties-section">
          <PropiedadesList
            isAuthenticated={isAuthenticated}
            setShowAuthForm={setShowAuthForm}
            setIsRegistering={setIsRegistering}
          />
        </section>
      </main>

      {showAuthForm && (
        <div className="auth-modal-overlay">
          <AuthForm
            onAuthSuccess={handleAuthSuccess}
            onCancel={handleAuthCancel}
            isRegister={isRegistering}
          />
        </div>
      )}

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-title">
              <strong>MKalpin Negocios Inmobiliarios</strong>
            </div>
            <div className="footer-address">
              <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
              <span>Florida 142, Piso 8 Oficina "I", CABA, Argentina</span>
            </div>
            <div className="footer-contact">
              <i className="fas fa-phone-alt" aria-hidden="true"></i>
              <a href="tel:1156690002" title="Llamar por teléfono">
                11 5669-0002
              </a>
            </div>
            <div className="footer-contact">
              <i className="fas fa-envelope" aria-hidden="true"></i>
              <a href="mailto:mkalpinni@gmail.com" title="Enviar email">
                mkalpinni@gmail.com
              </a>
            </div>
          </div>
          
          <div className="footer-social">
            <span className="footer-social-title">Seguinos</span>
            <div className="footer-social-icons">
              <a 
                href="https://www.facebook.com/profile.php?id=100063507733126" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Seguir en Facebook"
                title="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a 
                href="https://www.instagram.com/mkalpinni/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Seguir en Instagram"
                title="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://api.whatsapp.com/message/L4HL64FWSL4UH1?autoload=1&app_absent=02" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Contactar por WhatsApp"
                title="WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-copy">
          © {new Date().getFullYear()} MKalpin Negocios Inmobiliarios. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default App;