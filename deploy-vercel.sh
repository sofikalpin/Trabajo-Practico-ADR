#!/bin/bash

echo "🚀 Iniciando deploy en Vercel..."

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
fi

# Verificar si estás logueado
if ! vercel whoami &> /dev/null; then
    echo "🔐 Necesitas hacer login en Vercel..."
    vercel login
fi

echo "📦 Haciendo deploy..."
vercel --prod

echo "✅ Deploy completado!"
echo ""
echo "📋 Recuerda configurar las variables de entorno en Vercel:"
echo "   - MONGODB_URI"
echo "   - DB_URL" 
echo "   - JWT_SECRET"
echo "   - NODE_ENV"
echo ""
echo "🔗 Ve a tu dashboard de Vercel para configurar las variables"