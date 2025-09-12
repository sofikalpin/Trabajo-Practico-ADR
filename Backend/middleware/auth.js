const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'supersecreta';
module.exports = function(req, res, next) {
  const token = req.header('Authorization');
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(' Middleware auth - Headers recibidos:', {
      authorization: token ? 'PRESENTE' : 'AUSENTE',
      contentType: req.header('Content-Type'),
      method: req.method,
      url: req.url
    });
  }
  if (!token) {
    console.log(' No hay token en el header Authorization');
    return res.status(401).json({ 
      success: false,
      msg: 'No hay token, autorización denegada' 
    });
  }

  try {
    const tokenParts = token.split(' ');
    const actualToken = tokenParts.length === 2 && tokenParts[0] === 'Bearer' 
      ? tokenParts[1] 
      : token;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Token procesado:', {
        originalLength: token.length,
        parts: tokenParts.length,
        hasBearer: tokenParts[0] === 'Bearer',
        tokenPreview: actualToken.substring(0, 20) + '...'
      });
    }

    const decoded = jwt.verify(actualToken, jwtSecret);
    req.user = decoded.user;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Token válido, usuario:', decoded.user.id);
    }
    
    next();
  } catch (err) {
    console.error('❌ Error de verificación de token:', err.message);
    
    let errorMessage = 'Token no válido';
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token expirado';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Token malformado';
    }
    
    res.status(401).json({ 
      success: false,
      msg: errorMessage 
    });
  }
};