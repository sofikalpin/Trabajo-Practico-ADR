# Usar la imagen oficial de Node.js
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Crear directorio para uploads si no existe
RUN mkdir -p uploads

# Exponer el puerto (ajustar según tu configuración)
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
