#!/bin/bash

echo "🚀 Iniciando despliegue corregido..."

# Detener servicios existentes
echo "⏹️ Deteniendo servicios existentes..."
docker-compose -f docker-compose.prod.yml down

# Limpiar contenedores e imágenes antiguas
echo "🧹 Limpiando contenedores e imágenes antiguas..."
docker system prune -f

# Descargar las imágenes más recientes
echo "📥 Descargando imágenes actualizadas..."
docker pull sofiaka/inmobiliaria-backend:latest
docker pull sofiaka/inmobiliaria-frontend:latest

# Levantar los servicios
echo "🔄 Levantando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar un momento para que los servicios se inicien
echo "⏳ Esperando que los servicios se inicien..."
sleep 30

# Verificar el estado de los contenedores
echo "📊 Estado de los contenedores:"
docker ps

# Verificar logs del backend
echo "📋 Logs del backend:"
docker logs inmobiliaria_backend --tail 20

# Verificar logs de MongoDB
echo "📋 Logs de MongoDB:"
docker logs inmobiliaria_mongodb --tail 10

echo "✅ Despliegue completado!"
echo "🌐 Tu aplicación debería estar disponible en:"
echo "   - Frontend directo: 
http://20.121.65.197"
echo "   - A través de Nginx: http://20.121.65.197:8080"
echo "   - Backend API: http://20.121.65.197:5000"

echo "🔍 Para verificar que todo funciona:"
echo "   curl http://20.121.65.197:5000/propiedades"
