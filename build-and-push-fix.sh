#!/bin/bash

echo "🔨 RECONSTRUYENDO Y SUBIENDO IMÁGENES CORREGIDAS"
echo "==============================================="

# Verificar que estamos logueados en Docker Hub
echo "🔐 Verificando login en Docker Hub..."
if ! docker info | grep -q "Username"; then
    echo "⚠️ No estás logueado en Docker Hub. Ejecuta: docker login"
    read -p "¿Quieres hacer login ahora? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker login
    else
        echo "❌ Necesitas estar logueado para subir las imágenes"
        exit 1
    fi
fi

# Construir imagen del backend
echo ""
echo "🏗️ Construyendo imagen del backend..."
cd Backend
docker build -t sofiaka/inmobiliaria-backend:latest .
if [ $? -eq 0 ]; then
    echo "✅ Backend construido exitosamente"
else
    echo "❌ Error al construir el backend"
    exit 1
fi

# Subir imagen del backend
echo ""
echo "📤 Subiendo imagen del backend a Docker Hub..."
docker push sofiaka/inmobiliaria-backend:latest
if [ $? -eq 0 ]; then
    echo "✅ Backend subido exitosamente"
else
    echo "❌ Error al subir el backend"
    exit 1
fi

# Construir imagen del frontend
echo ""
echo "🏗️ Construyendo imagen del frontend..."
cd ../Frontend
docker build -t sofiaka/inmobiliaria-frontend:latest .
if [ $? -eq 0 ]; then
    echo "✅ Frontend construido exitosamente"
else
    echo "❌ Error al construir el frontend"
    exit 1
fi

# Subir imagen del frontend
echo ""
echo "📤 Subiendo imagen del frontend a Docker Hub..."
docker push sofiaka/inmobiliaria-frontend:latest
if [ $? -eq 0 ]; then
    echo "✅ Frontend subido exitosamente"
else
    echo "❌ Error al subir el frontend"
    exit 1
fi

cd ..

echo ""
echo "🎉 ¡TODAS LAS IMÁGENES HAN SIDO ACTUALIZADAS!"
echo "============================================="
echo ""
echo "📋 Próximos pasos:"
echo "1. Copia el archivo 'docker-compose.prod.yml' a tu máquina virtual"
echo "2. Copia el archivo 'deploy-fix.sh' a tu máquina virtual"
echo "3. En tu máquina virtual, ejecuta: ./deploy-fix.sh"
echo ""
echo "🔍 Para diagnosticar problemas, también puedes copiar 'diagnostico.sh'"
