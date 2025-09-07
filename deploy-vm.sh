#!/bin/bash

echo "🚀 Desplegando aplicación inmobiliaria en máquina virtual..."

# Obtener la IP de la máquina virtual
VM_IP=$(hostname -I | awk '{print $1}')
echo "📍 IP de la máquina virtual: $VM_IP"

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
echo "🌐 Frontend disponible en: http://$VM_IP:3000"
echo "🔧 Backend API disponible en: http://$VM_IP:5000"
echo "🗄️  MongoDB disponible en: $VM_IP:27017"
echo ""
echo "📱 Para acceder desde otra máquina:"
echo "   Frontend: http://$VM_IP:3000"
echo "   Backend: http://$VM_IP:5000"
echo ""
echo "🔍 Verificar logs si hay problemas:"
echo "   docker-compose logs frontend"
echo "   docker-compose logs backend" 