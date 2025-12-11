import { client } from '../axios/axios.config'

export interface FiltersResponse {
  success: boolean
  data: {
    paises: Array<{ id: number; nombre: string }>
    ciudades: Array<{ id: number; nombre: string }>
    intereses: Array<{ id: number; tipo: string }>
    ageGroups: Array<{ id: number; label: string }>
  }
}

/**
 * Obtener todos los filtros disponibles (países, ciudades, intereses, grupos de edad)
 */
export const getFilters = async (): Promise<FiltersResponse> => {
  try {
    const response = await client.get<FiltersResponse>('/filtros')
    return response.data
  } catch (error: any) {
    console.error('Error fetching filters:', error)
    throw error
  }
}

