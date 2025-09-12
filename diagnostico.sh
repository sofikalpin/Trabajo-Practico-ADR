#!/bin/bash

echo "DIAGNÓSTICO DE LA APLICACIÓN INMOBILIARIA"
echo "=========================================="

# Verificar que Docker esté corriendo
echo "Verificando Docker..."
if ! docker --version > /dev/null 2>&1; then
    echo "Docker no está instalado o no está corriendo"
    exit 1
else
    echo "Docker está funcionando"
fi

# Verificar contenedores
echo ""
echo "Estado de los contenedores:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verificar conectividad de red
echo ""
echo "Verificando conectividad de red..."

# Verificar backend
echo "Backend (puerto 5000):"
if curl -s http://localhost:5000/propiedades > /dev/null; then
    echo "Backend responde correctamente"
else
    echo "Backend no responde"
fi

# Verificar frontend
echo "Frontend (puerto 80):"
if curl -s http://localhost > /dev/null; then
    echo "Frontend responde correctamente"
else
    echo "Frontend no responde"
fi

# Verificar Nginx
echo "Nginx (puerto 8080):"
if curl -s http://localhost:8080 > /dev/null; then
    echo "Nginx responde correctamente"
else
    echo "Nginx no responde"
fi

# Verificar MongoDB
echo ""
echo "Verificando MongoDB..."
if docker exec inmobiliaria_mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "MongoDB está funcionando"
else
    echo "MongoDB no responde"
fi

# Mostrar logs recientes
echo ""
echo "Logs recientes del backend:"
docker logs inmobiliaria_backend --tail 10

echo ""
echo "Logs recientes de MongoDB:"
docker logs inmobiliaria_mongodb --tail 5

echo ""
echo "COMANDOS ÚTILES:"
echo "- Ver todos los logs del backend: docker logs inmobiliaria_backend"
echo "- Ver logs en tiempo real: docker logs -f inmobiliaria_backend"
echo "- Reiniciar servicios: docker-compose -f docker-compose.prod.yml restart"
echo "- Acceder al contenedor del backend: docker exec -it inmobiliaria_backend /bin/bash"
