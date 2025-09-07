const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'supersecreta';

module.exports = function(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  try {
    const tokenParts = token.split(' ');
    const actualToken = tokenParts.length === 2 && tokenParts[0] === 'Bearer' ? tokenParts[1] : token;

    const decoded = jwt.verify(actualToken, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Error de verificación de token:', err.message);
    res.status(401).json({ msg: 'Token no válido' });
  }
};