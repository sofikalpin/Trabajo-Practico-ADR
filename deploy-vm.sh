#!/bin/bash

# Script de despliegue para VM de Azure (producción)
echo "🚀 Iniciando despliegue en VM de Azure..."

# Variables de configuración
DOCKER_USERNAME="sofiakalpin"
BACKEND_IMAGE="$DOCKER_USERNAME/inmobiliaria-backend:latest"
FRONTEND_IMAGE="$DOCKER_USERNAME/inmobiliaria-frontend:latest"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instalando Docker..."
    
    # Actualizar paquetes
    sudo apt-get update
    
    # Instalar dependencias
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Agregar clave GPG de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Agregar repositorio de Docker
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Agregar usuario al grupo docker
    sudo usermod -aG docker $USER
    
    echo "✅ Docker instalado exitosamente"
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Instalando..."
    
    # Descargar Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Dar permisos de ejecución
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo "✅ Docker Compose instalado exitosamente"
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down

# Descargar las imágenes más recientes
echo "📥 Descargando imágenes desde Docker Hub..."
docker pull $BACKEND_IMAGE
docker pull $FRONTEND_IMAGE

# Levantar los servicios en producción
echo "🔨 Levantando servicios en producción..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar el estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose -f docker-compose.prod.yml ps

# Obtener IP pública
PUBLIC_IP=$(curl -s ifconfig.me)

echo "✅ Despliegue en producción completado exitosamente!"
echo "🌐 La aplicación está disponible en:"
echo "   - Frontend: http://$PUBLIC_IP"
echo "   - Con Nginx (opcional): http://$PUBLIC_IP:8080"
echo ""
echo "📝 Para ver los logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Para detener la aplicación:"
echo "   docker-compose -f docker-compose.prod.yml down"