import { client } from '../axios/axios.config'

export interface FiltersResponse {
  success: boolean
  data: {
    paises: Array<{ id: number; nombre: string }>
    ciudades: Array<{ id: number; nombre: string; pais_id?: number }>
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

/**
 * Obtener ciudades por país
 */
export const getCiudadesByPais = async (paisId: number): Promise<Array<{ id: number; nombre: string; pais_id: number }>> => {
  try {
    const response = await client.get(`/filtros/ciudades/pais/${paisId}`)
    return response.data.data || response.data
  } catch (error: any) {
    console.error('Error fetching cities by country:', error)
    throw error
  }
}

