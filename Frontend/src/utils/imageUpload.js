import axios from 'axios';

// Función para convertir archivo a base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Función para subir imagen a Cloudinary via nuestra API
export const uploadImage = async (file, propiedadId = null) => {
  try {
    // Validar archivo
    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WebP');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB');
    }

    // Convertir a base64
    const base64 = await fileToBase64(file);

    // Subir a través de nuestra API
    const response = await axios.post('/upload-image', {
      image: base64,
      propiedadId: propiedadId
    });

    if (response.data.success) {
      return {
        url: response.data.data.url,
        publicId: response.data.data.publicId,
        principal: false
      };
    } else {
      throw new Error(response.data.error || 'Error al subir imagen');
    }

  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

// Función para subir múltiples imágenes
export const uploadMultipleImages = async (files, propiedadId = null, onProgress = null) => {
  const uploadedImages = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    try {
      if (onProgress) {
        onProgress(i + 1, files.length, `Subiendo imagen ${i + 1}...`);
      }

      const result = await uploadImage(files[i], propiedadId);
      
      // La primera imagen es principal
      if (i === 0) {
        result.principal = true;
      }
      
      uploadedImages.push(result);
      
    } catch (error) {
      console.error(`Error al subir imagen ${i + 1}:`, error);
      errors.push({
        file: files[i].name,
        error: error.message
      });
    }
  }

  return {
    uploadedImages,
    errors
  };
};

// Función para obtener URL optimizada de Cloudinary
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  const {
    width = 400,
    height = 300,
    quality = 'auto',
    format = 'webp'
  } = options;

  // Insertar transformaciones en la URL de Cloudinary
  const transformations = `w_${width},h_${height},c_fill,q_${quality},f_${format}`;
  
  return originalUrl.replace('/upload/', `/upload/${transformations}/`);
};

const imageUploadUtils = {
  uploadImage,
  uploadMultipleImages,
  getOptimizedImageUrl
};

export default imageUploadUtils;
