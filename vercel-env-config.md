# 🔧 Configuración de Variables de Entorno para Vercel

## Variables que debes configurar en Vercel:

### 1. MongoDB Atlas
```
MONGODB_URI=mongodb+srv://utnsofi_db_user:h2I5bAxwmAkWVA8G@mkalpin.s4trunq.mongodb.net/inmobiliaria?retryWrites=true&w=majority
DB_URL=mongodb+srv://utnsofi_db_user:h2I5bAxwmAkWVA8G@mkalpin.s4trunq.mongodb.net/inmobiliaria?retryWrites=true&w=majority
```

### 2. JWT Secret
```
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_para_produccion
```

### 3. Entorno
```
NODE_ENV=production
```

### 4. Cloudinary (Opcional - para subida de imágenes)
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## 📋 Cómo configurar en Vercel:

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** > **Environment Variables**
3. Agrega cada variable una por una:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://utnsofi_db_user:h2I5bAxwmAkWVA8G@mkalpin.s4trunq.mongodb.net/inmobiliaria?retryWrites=true&w=majority`
   - **Environment**: Production, Preview, Development (marcar todos)

4. Repite para las demás variables

## ⚠️ Importante:
- **NUNCA** subas archivos `.env` con credenciales reales a GitHub
- Usa siempre las variables de entorno de Vercel para producción
- El archivo `.env.local` es solo para desarrollo local