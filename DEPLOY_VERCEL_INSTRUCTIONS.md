# 🚀 Instrucciones de Deploy en Vercel

## ✅ Configuración Completada

Tu proyecto ya está configurado para deploy en Vercel con:
- ✅ Frontend React optimizado
- ✅ API serverless en `/api`
- ✅ Conexión a MongoDB Atlas
- ✅ Autenticación JWT
- ✅ Subida de imágenes con Cloudinary

## 📋 Pasos para el Deploy

### 1. Preparar Variables de Entorno

Antes del deploy, necesitas configurar estas variables en Vercel:

#### Variables Requeridas:
```bash
# MongoDB Atlas (ya configurado)
MONGODB_URI=mongodb+srv://utnsofi_db_user:h2I5bAxwmAkWVA8G@mkalpin.s4trunq.mongodb.net/inmobiliaria?retryWrites=true&w=majority
DB_URL=mongodb+srv://utnsofi_db_user:h2I5bAxwmAkWVA8G@mkalpin.s4trunq.mongodb.net/inmobiliaria?retryWrites=true&w=majority

# JWT Secret (cambiar por uno más seguro)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_para_produccion

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Entorno
NODE_ENV=production
```

### 2. Deploy en Vercel

#### Opción A: Deploy desde GitHub (Recomendado)
1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio de GitHub
4. Vercel detectará automáticamente la configuración
5. Agrega las variables de entorno en la configuración del proyecto

#### Opción B: Deploy desde CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

### 3. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en el dashboard de Vercel
2. Ve a Settings > Environment Variables
3. Agrega cada variable:
   - `MONGODB_URI`: Tu string de conexión de MongoDB Atlas
   - `JWT_SECRET`: Un string aleatorio y seguro
   - `CLOUDINARY_CLOUD_NAME`: Tu cloud name de Cloudinary
   - `CLOUDINARY_API_KEY`: Tu API key de Cloudinary
   - `CLOUDINARY_API_SECRET`: Tu API secret de Cloudinary
   - `NODE_ENV`: `production`

### 4. Configurar Cloudinary (Opcional)

Si quieres usar Cloudinary para imágenes:
1. Crea cuenta en [cloudinary.com](https://cloudinary.com)
2. Obtén tus credenciales del dashboard
3. Agrega las variables de entorno en Vercel

### 5. Verificar el Deploy

Una vez deployado, tu aplicación estará disponible en:
- **Frontend**: `https://tu-proyecto.vercel.app`
- **API**: `https://tu-proyecto.vercel.app/api`

## 🔧 Estructura de la API

### Endpoints Disponibles:
- `GET /api/propiedades` - Listar propiedades
- `POST /api/propiedades` - Crear propiedad (requiere auth)
- `GET /api/propiedades/[id]` - Obtener propiedad por ID
- `PUT /api/propiedades/[id]` - Actualizar propiedad (requiere auth)
- `DELETE /api/propiedades/[id]` - Eliminar propiedad (requiere auth)
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (requiere auth)
- `GET /api/auth/me` - Obtener usuario actual (requiere auth)
- `POST /api/auth/logout` - Cerrar sesión (requiere auth)
- `POST /api/upload-image` - Subir imagen a Cloudinary

## 🐛 Troubleshooting

### Error de CORS
- Las funciones serverless ya tienen CORS configurado
- Si persiste, verifica que las URLs estén correctas

### Error de MongoDB
- Verifica que `MONGODB_URI` esté correctamente configurada
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas

### Error de JWT
- Verifica que `JWT_SECRET` esté configurado
- Asegúrate de usar el mismo secret en frontend y backend

### Error de Cloudinary
- Verifica las credenciales de Cloudinary
- Asegúrate de que la cuenta esté activa

## 📱 Funcionalidades

### Frontend
- ✅ Lista de propiedades con filtros
- ✅ Formulario de creación/edición
- ✅ Autenticación de usuarios
- ✅ Subida de imágenes
- ✅ Responsive design

### Backend (Serverless)
- ✅ CRUD completo de propiedades
- ✅ Autenticación JWT
- ✅ Validaciones de datos
- ✅ Conexión a MongoDB Atlas
- ✅ Subida de imágenes a Cloudinary

## 🎉 ¡Listo!

Tu aplicación inmobiliaria está lista para producción en Vercel. 

**URL de tu app**: `https://tu-proyecto.vercel.app`

Para cualquier problema, revisa los logs en el dashboard de Vercel o contacta al equipo de soporte.