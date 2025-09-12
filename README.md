# Sistema Inmobiliario MKalpin - Trabajo Práctico Full Stack

## Descripción del Proyecto

Sistema web para gestión de propiedades inmobiliarias desarrollado con React y Node.js. Permite crear, editar y visualizar propiedades con sistema de autenticación y carga de imágenes.

### Funcionalidades Principales

- Sistema de autenticación con JWT
- CRUD completo de propiedades
- Carga múltiple de imágenes (hasta 20 por propiedad)
- Filtros por tipo, transacción y disponibilidad
- Interfaz responsive
- Despliegue con Docker

## Stack Tecnológico

**Backend:** Node.js, Express, MongoDB, JWT, Multer  
**Frontend:** React, Axios, CSS3  
**Despliegue:** Docker, Docker Compose, Nginx, Azure

## Instalación y Despliegue

### Prerrequisitos

- Docker Desktop 4.0+
- Docker Compose 3.8+
- Git 2.30+

### Despliegue Local

#### Con Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/Trabajo-Practico-ADR.git
cd Trabajo-Practico-ADR

# 2. Ejecutar con Docker Compose
docker-compose up -d

# 3. Verificar que todos los servicios estén corriendo
docker-compose ps

# 4. Ver logs en tiempo real (opcional)
docker-compose logs -f
```

#### Sin Docker

```bash
# 1. Clonar e instalar dependencias del backend
cd Backend
npm install
cp .env.example .env  # Configurar variables de entorno

# 2. Instalar dependencias del frontend
cd ../Frontend
npm install

# 3. Iniciar MongoDB (requiere instalación local)
mongod --dbpath ./data

# 4. Inicializar base de datos
cd ../Backend
node seed.js

# 5. Ejecutar backend
npm run dev

# 6. En otra terminal, ejecutar frontend
cd ../Frontend
npm start
```

### URLs de Acceso Local

- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017

### 2. Construcción Manual de Imágenes

```bash
# Construir imagen del backend
cd Backend
docker build -t sofiakalpin/inmobiliaria-backend:latest .

# Construir imagen del frontend
cd ../Frontend
docker build -t sofiakalpin/inmobiliaria-frontend:latest .
```

### 3. Subir Imágenes a Docker Hub

```bash
# Hacer login en Docker Hub
docker login

# Subir imágenes
docker push sofiakalpin/inmobiliaria-backend:latest
docker push sofiakalpin/inmobiliaria-frontend:latest
```

### 4. Despliegue en Azure VM

#### Crear VM en Azure
1. Acceder al portal de Azure
2. Crear una nueva VM con Ubuntu Server 20.04 LTS
3. Configurar reglas de red para abrir puertos 80, 8080 y 22
4. Conectarse por SSH

#### Desplegar en la VM
```bash
# Copiar archivos necesarios a la VM
scp docker-compose.prod.yml deploy-vm.sh usuario@ip-publica:~/

# Conectarse por SSH
ssh usuario@ip-publica

# Ejecutar script de despliegue
chmod +x deploy-vm.sh
./deploy-vm.sh
```

## 📁 Estructura del Proyecto

```
Trabajo-Practico-ADR/
├── Backend/
│   ├── Dockerfile
│   ├── app.js
│   ├── package.json
│   ├── propiedad.js
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── uploads/
├── Frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── public/
│   └── src/
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
├── deploy.sh
├── deploy-vm.sh
└── README.md
```

## 🐳 Configuración de Docker

### Backend Dockerfile
- Imagen base: `node:18-alpine`
- Puerto expuesto: 5000
- Volumen para uploads

### Frontend Dockerfile
- Build multi-etapa con Node.js y Nginx
- Puerto expuesto: 80
- Configuración de proxy para API

### Docker Compose
- **Desarrollo**: `docker-compose.yml`
- **Producción**: `docker-compose.prod.yml`

## 🔧 Configuración de Nginx (Proxy Inverso)

El sistema incluye configuración de Nginx como proxy inverso opcional que:
- Sirve el frontend en el puerto 80
- Redirige las llamadas API al backend
- Maneja las imágenes estáticas
- Proporciona balanceador de carga

## 👥 Usuarios de Prueba

El sistema incluye usuarios predefinidos para testing:

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **Administrador** | admin@inmobiliaria.com | adminpassword | Gestión completa + registro de usuarios |
| **Agente** | agente@inmobiliaria.com | agentepassword | Gestión de propiedades |
| **Usuario** | usuario@inmobiliaria.com | userpassword | Solo visualización |

> ⚠️ **Importante**: Cambiar estas credenciales en producción por seguridad.

## 🌐 URLs de Acceso

### Desarrollo Local
- Frontend: http://localhost
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api

### Producción (Azure)
- Frontend: http://[IP-PUBLICA]
- Con Nginx: http://[IP-PUBLICA]:8080

## 📊 Documentación de la API

### 🔐 Autenticación

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| `POST` | `/api/auth/login` | Iniciar sesión | ❌ |
| `POST` | `/api/auth/register` | Registrar nuevo usuario | ✅ (Admin) |
| `GET` | `/api/auth/me` | Obtener perfil del usuario | ✅ |
| `POST` | `/api/auth/logout` | Cerrar sesión | ✅ |


### 🏠 Propiedades

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| `GET` | `/propiedades` | Listar propiedades con filtros | ❌ |
| `POST` | `/propiedades` | Crear nueva propiedad | ✅ |
| `GET` | `/propiedades/:id` | Obtener propiedad específica | ❌ |
| `PUT` | `/propiedades/:id` | Actualizar propiedad | ✅ |
| `DELETE` | `/propiedades/:id` | Eliminar propiedad | ✅ |

#### Filtros Disponibles (GET /propiedades)
- `tipo`: Casa, Departamento, Oficina, etc.
- `transaccion`: Venta, Alquiler, Alquiler Temporario
- `disponible`: true/false
- `limit`: Número de resultados (default: 50)
- `page`: Página de resultados (default: 1)


### 📁 Archivos y Recursos

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| `GET` | `/uploads/:filename` | Obtener imagen de propiedad | ❌ |
| `GET` | `/health` | Health check del servidor | ❌ |

### 🔒 Autenticación JWT

Para endpoints protegidos, incluir el token en el header:
```
Authorization: Bearer <tu-jwt-token>
```

### 📝 Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `200` | Éxito |
| `201` | Recurso creado |
| `400` | Error de validación |
| `401` | No autorizado |
| `403` | Acceso denegado |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor |

## 🔍 Comandos Útiles

```bash
# Ver logs de los contenedores
docker-compose logs -f

# Detener todos los servicios
docker-compose down

# Reconstruir imágenes
docker-compose up --build

# Ver estado de contenedores
docker-compose ps

# Acceder al contenedor del backend
docker exec -it inmobiliaria_backend sh

# Ver logs específicos
docker-compose logs backend
docker-compose logs frontend
```

## 🚨 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
docker-compose ps mongodb

# Ver logs de MongoDB
docker-compose logs mongodb
```

### Error de imágenes no visibles
```bash
# Verificar volumen de uploads
docker volume ls
docker volume inspect trabajo-practico-adr_backend_uploads
```

### Error de proxy
```bash
# Verificar configuración de Nginx
docker-compose logs frontend
```

## 📝 Notas Importantes

1. **Puertos**: Asegúrate de que los puertos 80, 5000 y 27017 estén disponibles
2. **Memoria**: MongoDB requiere al menos 1GB de RAM
3. **Volúmenes**: Los datos se persisten en volúmenes de Docker
4. **Red**: Todos los servicios están en la misma red Docker

## 🎥 Video Demostrativo

[Enlace al video demostrativo - Máximo 3 minutos]

## 🏗️ Arquitectura del Sistema

```
Frontend (React) ◄──► Backend (Node.js) ◄──► MongoDB
       │                     │                  │
       └─────────────────────┼──────────────────┘
                             │
                    File System (Uploads)
```

## 👨‍💻 Autor

**Sofia Kalpin** - Trabajo Práctico Full Stack

## 📄 Licencia

Este proyecto es parte del Trabajo Práctico N°5 de Desarrollo Full Stack.