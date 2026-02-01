import { client } from '../axios/axios.config'

// Service para actualizar la fecha de nacimiento del usuario
export const updateBirthDate = async (fecha_nacimiento: string) => {
  try {
    const response = await client.post('/verificacion/actualizarFechaNacimiento', {
      fecha_nacimiento,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Convertir archivo a base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remover el prefijo "data:image/...;base64,"
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}

export const getVerificacion = async () => {
  try{ 
    const response = await client.get<{ verificacion: boolean }>('/verificacion/obtenerVerificacion');
    return response.data.verificacion;
  }
  catch (error) {
    throw error;
  }
}

export interface VerificacionStatus {
  verificacion: boolean;
  fecha_nacimiento?: string | null;
  edad?: number;
}

export const getVerificacionCompleta = async (): Promise<VerificacionStatus> => {
  try { 
    const response = await client.get<VerificacionStatus>('/verificacion/obtenerVerificacionCompleta');
    return response.data;
  }
  catch (error) {
    throw error;
  }
}