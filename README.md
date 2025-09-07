# Aplicación Inmobiliaria

## Descripción
Aplicación web para gestión de propiedades inmobiliarias con backend en Node.js/Express y frontend en React.

## Estructura del Proyecto
```
ADR/
├── Backend/                 # API REST en Node.js/Express
├── Frontend/               # Aplicación React
└── docker-compose.yml      # Orquestación de servicios
```

## Requisitos Previos
- Docker
- Docker Compose
- Git

## Despliegue

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd ADR
```

### 2. Configurar variables de entorno
Crear archivo `Backend/.env`:
```env
NODE_ENV=production
PORT=5000
DB_URL=mongodb://mongo:27017/inmobiliaria
JWT_SECRET=tu_clave_secreta_jwt_aqui
```

### 3. Desplegar con Docker Compose

#### Para desarrollo local:
```bash
# Dar permisos de ejecución al script de despliegue
chmod +x deploy.sh

# Ejecutar despliegue automático
./deploy.sh

# O manualmente:
docker-compose up --build -d
```

#### Para máquina virtual (acceso externo):
```bash
# Dar permisos de ejecución al script de despliegue para VM
chmod +x deploy-vm.sh

# Ejecutar despliegue automático
./deploy-vm.sh

# O manualmente:
docker-compose up --build -d
```

### 4. Verificar servicios
```bash
docker-compose ps
```

## Acceso a la Aplicación

### Desarrollo Local
- **Frontend**: http://localhost:3000 (puerto 3000)
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### Máquina Virtual (Acceso Externo)
- **Frontend**: http://[IP_VM]:3000 (puerto 3000)
- **Backend API**: http://[IP_VM]:5000
- **MongoDB**: [IP_VM]:27017

**Nota**: Reemplaza `[IP_VM]` con la IP real de tu máquina virtual (ej: 20.121.65.197)

## Solución de Problemas

### Error 502 Bad Gateway
Si encuentras este error, verifica:

1. **Estado de los contenedores**:
   ```bash
   docker-compose ps
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **Puertos en uso**:
   ```bash
   netstat -tulpn | grep :80
   netstat -tulpn | grep :5000
   ```

3. **Reiniciar servicios**:
   ```bash
   docker-compose restart
   ```

### Problemas Comunes

#### Backend no responde
- Verificar que MongoDB esté ejecutándose
- Revisar logs: `docker-compose logs backend`
- Verificar variables de entorno

#### Frontend no carga imágenes
- Verificar que el backend esté funcionando
- Revisar configuración de nginx
- Verificar rutas de uploads

#### Problemas de CORS
- Verificar configuración en `Backend/app.js`
- Asegurar que las URLs estén en la lista de orígenes permitidos

## Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart backend

# Ejecutar comandos en un contenedor
docker-compose exec backend sh
docker-compose exec frontend sh

# Detener todos los servicios
docker-compose down

# Limpiar recursos no utilizados
docker system prune -f
```

## Desarrollo Local

Para desarrollo local sin Docker:

### Backend
```bash
cd Backend
npm install
npm run dev
```

### Frontend
```bash
cd Frontend/inmobiliaria-frontend
npm install
npm start
```

## Tecnologías Utilizadas
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, CSS3
- **Base de Datos**: MongoDB
- **Contenedores**: Docker, Docker Compose
- **Servidor Web**: Nginx
- **Autenticación**: JWT

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. 