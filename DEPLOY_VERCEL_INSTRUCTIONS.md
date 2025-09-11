# 🚀 Guía de Deployment en Vercel

## Preparación Completada ✅

He preparado tu aplicación para Vercel con los siguientes cambios:

### 📁 Archivos Creados/Modificados:

1. **`vercel.json`** - Configuración de Vercel
2. **`package.json`** (raíz) - Scripts de build
3. **`api/`** - Funciones serverless:
   - `api/auth/login.js` - Autenticación
   - `api/propiedades.js` - CRUD de propiedades
   - `api/package.json` - Dependencias del API
4. **`Frontend/src/axiosConfig.js`** - Configurado para Vercel
5. **`env.example`** - Variables de entorno

## 🗄️ Paso 1: Configurar Base de Datos (MongoDB Atlas)

**Necesitas una base de datos en la nube:**

1. **Ve a [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Crea una cuenta gratuita**
3. **Crea un cluster gratuito**
4. **Obtén la connection string:**
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/inmobiliaria
   ```

## 🚀 Paso 2: Deploy en Vercel

### Opción A: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub:**
   ```bash
   git add .
   git commit -m "Preparado para Vercel"
   git push origin main
   ```

2. **Ve a [vercel.com](https://vercel.com)**
3. **Conecta tu repositorio de GitHub**
4. **Configura las variables de entorno:**
   - `MONGODB_URI`: Tu connection string de MongoDB Atlas
   - `JWT_SECRET`: Una clave secreta (ej: `mi_super_secreto_jwt_2024`)
   - `NODE_ENV`: `production`

### Opción B: Desde CLI

1. **Instala Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login en Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Configura variables de entorno:**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```

## ⚙️ Variables de Entorno Requeridas

En Vercel, configura estas variables:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `MONGODB_URI` | Connection string de MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/inmobiliaria` |
| `JWT_SECRET` | Clave secreta para JWT | `mi_super_secreto_jwt_2024` |
| `NODE_ENV` | Entorno de producción | `production` |

## 🔧 Funcionalidades Adaptadas

### ✅ Lo que funciona en Vercel:
- ✅ Frontend React completo
- ✅ Autenticación JWT
- ✅ CRUD de propiedades (sin imágenes)
- ✅ Filtros y búsqueda
- ✅ Responsive design

### ⚠️ Limitaciones en Vercel:
- ❌ **Carga de imágenes**: Vercel no permite almacenamiento de archivos
- ❌ **Multer**: No funciona en funciones serverless

## 🖼️ Solución para Imágenes (Opcional)

Para manejar imágenes, puedes usar:

1. **Cloudinary** (Recomendado)
2. **AWS S3**
3. **Vercel Blob** (Beta)

### Ejemplo con Cloudinary:

```bash
npm install cloudinary
```

## 🧪 Testing Local

Para probar localmente con la nueva configuración:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ejecutar en modo desarrollo
vercel dev
```

## 📋 Checklist de Deployment

- [ ] Código subido a GitHub
- [ ] MongoDB Atlas configurado
- [ ] Proyecto conectado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Funcionalidades probadas

## 🔗 URLs Esperadas

Después del deploy tendrás:

- **Frontend**: `https://tu-app.vercel.app`
- **API Login**: `https://tu-app.vercel.app/api/auth/login`
- **API Propiedades**: `https://tu-app.vercel.app/api/propiedades`

## 🆘 Troubleshooting

### Error de CORS:
- Las funciones ya incluyen headers CORS

### Error de Base de Datos:
- Verifica la connection string de MongoDB
- Asegúrate que el cluster esté activo

### Error 500:
- Revisa los logs en Vercel Dashboard
- Verifica las variables de entorno

---

**¡Tu aplicación está lista para Vercel!** 🎉

Solo necesitas configurar MongoDB Atlas y hacer el deploy.
