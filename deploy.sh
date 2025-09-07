#!/bin/bash

echo "🚀 Desplegando aplicación inmobiliaria..."

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Limpiar imágenes existentes
echo "🧹 Limpiando imágenes existentes..."
docker system prune -f

# Construir y levantar servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

echo "✅ Despliegue completado!"
echo "🌐 Frontend disponible en: http://localhost:3000"
echo "🔧 Backend disponible en: http://localhost:5000"
echo "🗄️  MongoDB disponible en: localhost:27017" 