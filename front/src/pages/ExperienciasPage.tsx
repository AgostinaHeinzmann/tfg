import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, MapPin, Heart, MessageCircle, MoreHorizontal, Clock, Loader2, Search, X, Edit, Trash2, ZoomIn } from "lucide-react"
import { getFeed, createFeed, likePublication, commentPublication, deleteFeed, updateFeed } from "@/services/feedService"
import { getFilters } from "@/services/filtrosService"
import { auth } from "../../firebase/firebase.config"
import { showToast } from "@/lib/toast-utils"
import { loadFromLocalStorage } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const ExperienciasPage: React.FC = () => {
  const navigate = useNavigate()
  const [newPost, setNewPost] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [postCiudadId, setPostCiudadId] = useState<number | null>(null)
  const [postCiudadNombre, setPostCiudadNombre] = useState<string>("")
  const [citySearchQuery, setCitySearchQuery] = useState("")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [postInteresId, setPostInteresId] = useState<number | null>(null)
  const [postInteresNombre, setPostInteresNombre] = useState<string>("")
  const [showInteresDropdown, setShowInteresDropdown] = useState(false)
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ciudades, setCiudades] = useState<Array<{ id: number; nombre: string }>>([])
  const [intereses, setIntereses] = useState<Array<{ id: number; tipo: string }>>([])
  const [filterCityQuery, setFilterCityQuery] = useState("")
  const [selectedFilterCityId, setSelectedFilterCityId] = useState<number | null>(null)
  const [selectedFilterCityName, setSelectedFilterCityName] = useState<string>("")
  const [showFilterCityDropdown, setShowFilterCityDropdown] = useState(false)
  const [selectedIntereses, setSelectedIntereses] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [editDescription, setEditDescription] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [viewerImage, setViewerImage] = useState<string>("")

  // Obtener usuario_id del localStorage
  const userData = loadFromLocalStorage("userData")
  const currentUserId = userData?.usuario_id
  // Usar photoURL (Google) o imagen_perfil_id (backend) para la foto de perfil
  const userProfileImage = userData?.photoURL || userData?.imagen_perfil_id || auth.currentUser?.photoURL
  // Construir nombre desde backend o usar displayName de Google
  const userDisplayName = userData?.nombre 
    ? `${userData.nombre} ${userData.apellido || ''}`.trim()
    : userData?.displayName || auth.currentUser?.displayName || "Usuario"

  // Filtrar ciudades según búsqueda para el post
  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return ciudades.slice(0, 20)
    const query = citySearchQuery.toLowerCase()
    return ciudades.filter(
      city => city.nombre.toLowerCase().includes(query)
    ).slice(0, 20)
  }, [citySearchQuery, ciudades])

  // Filtrar ciudades para el filtro de búsqueda
  const filteredCitiesForFilter = useMemo(() => {
    if (!filterCityQuery.trim()) return ciudades.slice(0, 20)
    const query = filterCityQuery.toLowerCase()
    return ciudades.filter(
      city => city.nombre.toLowerCase().includes(query)
    ).slice(0, 20)
  }, [filterCityQuery, ciudades])

  // Cargar ciudades e intereses para los filtros
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response: any = await getFilters()
        if (response.success && response.data) {
          setCiudades(response.data.ciudades || [])
          setIntereses(response.data.intereses || [])
        }
      } catch (error) {
        console.error("Error loading filters:", error)
      }
    }
    loadFilters()
  }, [])

  // Cargar publicaciones
  const loadFeed = async () => {
    setLoading(true)
    try {
      const filters: any = { page, size: 10 }
      // Filtrar por ciudad si se seleccionó
      if (selectedFilterCityId) filters.ciudad_id = selectedFilterCityId
      // Enviar usuario_id para saber qué publicaciones tienen like del usuario
      if (currentUserId) filters.usuario_id = currentUserId
      // Filtrar por intereses seleccionados
      if (selectedIntereses.length > 0) {
        // Enviar como interests (array de tipos)
        const tipos = selectedIntereses.map(id => {
          const interes = intereses.find(i => i.id === id)
          return interes?.tipo
        }).filter(Boolean)
        filters.interests = tipos.join(",")
      }

      const response: any = await getFeed(filters)
      let data = response.data || []

      // Filtrado local por búsqueda de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        data = data.filter((exp: any) =>
          exp.descripcion?.toLowerCase().includes(query) ||
          exp.usuario?.nombre?.toLowerCase().includes(query) ||
          exp.usuario?.apellido?.toLowerCase().includes(query) ||
          exp.ciudad?.nombre?.toLowerCase().includes(query)
        )
      }

      setExperiences(data)
    } catch (error: any) {
      console.error("Error loading feed:", error)
      showToast.error("Error al cargar publicaciones", error.message || "No se pudieron cargar las experiencias")
      setExperiences([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeed()
  }, [page, selectedFilterCityId, selectedIntereses])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFeed()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Seleccionar ciudad para el filtro
  const selectFilterCity = (cityId: number, cityName: string) => {
    setSelectedFilterCityId(cityId)
    setSelectedFilterCityName(cityName)
    setFilterCityQuery("")
    setShowFilterCityDropdown(false)
  }

  const toggleInteres = (interesId: number) => {
    setSelectedIntereses(prev =>
      prev.includes(interesId)
        ? prev.filter(id => id !== interesId)
        : [...prev, interesId]
    )
  }

  const clearFilters = () => {
    setSelectedFilterCityId(null)
    setSelectedFilterCityName("")
    setFilterCityQuery("")
    setSelectedIntereses([])
    setSearchQuery("")
  }

  // Seleccionar ciudad para publicar
  const selectPostCity = (cityId: number, cityName: string) => {
    setPostCiudadId(cityId)
    setPostCiudadNombre(cityName)
    setCitySearchQuery("")
    setShowCityDropdown(false)
  }

  // Seleccionar interés para publicar
  const selectPostInteres = (interesId: number, interesNombre: string) => {
    setPostInteresId(interesId)
    setPostInteresNombre(interesNombre)
    setShowInteresDropdown(false)
  }

  // Editar publicación
  const handleEdit = (experience: any) => {
    setEditingPost(experience)
    setEditDescription(experience.descripcion || "")
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingPost || !currentUserId) return
    try {
      await updateFeed(editingPost.publicacion_id, {
        usuario_id: currentUserId,
        descripcion: editDescription
      })
      showToast.success("Actualizado", "Tu publicación se actualizó exitosamente")
      setEditDialogOpen(false)
      setEditingPost(null)
      loadFeed()
    } catch (error: any) {
      console.error("Error updating post:", error)
      showToast.error("Error", "No se pudo actualizar la publicación")
    }
  }

  // Eliminar publicación
  const handleDeleteConfirm = (publicacionId: number) => {
    setDeletingPostId(publicacionId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingPostId || !currentUserId) return
    try {
      await deleteFeed(deletingPostId, currentUserId)
      showToast.success("Eliminado", "Tu publicación se eliminó exitosamente")
      setDeleteDialogOpen(false)
      setDeletingPostId(null)
      loadFeed()
    } catch (error: any) {
      console.error("Error deleting post:", error)
      showToast.error("Error", "No se pudo eliminar la publicación")
    }
  }

  // Manejar subida de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast.warning("Imagen muy grande", "La imagen no puede superar los 5MB")
        return
      }

      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Convertir File a Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remover el prefijo "data:image/xxx;base64,"
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  // Manejar publicación
  const handlePublish = async () => {
    const user = auth.currentUser
    if (!user) {
      showToast.warning("Inicia sesión", "Debes iniciar sesión para publicar")
      navigate("/login")
      return
    }

    if (!newPost.trim()) {
      showToast.warning("Escribe algo", "La publicación no puede estar vacía")
      return
    }

    // Obtener usuario_id del localStorage (sincronizado con backend)
    const userData = loadFromLocalStorage("userData")
    const usuarioId = userData?.usuario_id

    if (!usuarioId) {
      showToast.error("Error de sesión", "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.")
      return
    }

    try {
      const feedData: any = {
        usuario_id: usuarioId,
        descripcion: newPost
      }

      if (postCiudadId) feedData.ciudad_id = postCiudadId
      // Enviar intereses como array de strings
      if (postInteresNombre) feedData.intereses = [postInteresNombre]

      // Convertir imagen a base64 si existe
      if (selectedImage) {
        const base64 = await fileToBase64(selectedImage)
        feedData.imagenes = [{
          base64,
          mimeType: selectedImage.type || 'image/jpeg'
        }]
      }

      await createFeed(feedData)
      showToast.success("Publicado", "Tu experiencia se publicó exitosamente")

      // Limpiar formulario
      setNewPost("")
      setSelectedImage(null)
      setImagePreview(null)
      setPostCiudadId(null)
      setPostCiudadNombre("")
      setCitySearchQuery("")
      setShowCityDropdown(false)
      setPostInteresId(null)
      setPostInteresNombre("")
      setShowInteresDropdown(false)

      // Recargar feed
      loadFeed()
    } catch (error: any) {
      console.error("Error creating post:", error)
      showToast.error("Error al publicar", error.message || "No se pudo publicar tu experiencia")
    }
  }

  // Manejar like
  const handleLike = async (publicacionId: number) => {
    if (!currentUserId) {
      showToast.warning("Inicia sesión", "Debes iniciar sesión para dar like")
      navigate("/login")
      return
    }
    try {
      const response: any = await likePublication(publicacionId, currentUserId)
      // Actualizar con los datos del servidor
      setExperiences(experiences.map(exp =>
        exp.publicacion_id === publicacionId
          ? { 
              ...exp, 
              me_gusta: response.data?.me_gusta ?? exp.me_gusta,
              liked: response.data?.liked ?? !exp.liked 
            }
          : exp
      ))
    } catch (error: any) {
      console.error("Error liking post:", error)
      showToast.error("Error", "No se pudo dar like")
    }
  }

  // Manejar comentario
  const handleComment = async (publicacionId: number, mensaje: string) => {
    const user = auth.currentUser
    if (!user) {
      showToast.warning("Inicia sesión", "Debes iniciar sesión para comentar")
      navigate("/login")
      return
    }

    // Obtener usuario_id del localStorage (sincronizado con backend)
    const userData = loadFromLocalStorage("userData")
    const usuarioId = userData?.usuario_id

    if (!usuarioId) {
      showToast.error("Error de sesión", "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.")
      return
    }

    try {
      await commentPublication(publicacionId, {
        usuario_id: usuarioId,
        mensaje
      })
      showToast.success("Comentado", "Tu comentario se agregó exitosamente")
      loadFeed() // Recargar para mostrar el nuevo comentario
    } catch (error: any) {
      console.error("Error commenting:", error)
      showToast.error("Error", "No se pudo agregar el comentario")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-indigo-900">Experiencias</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">Descubre y comparte experiencias de viaje con la comunidad</p>
        </div>

        {/* Create Post */}
        <Card className="border-indigo-100 shadow-md mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfileImage || "/placeholder.svg"} />
                <AvatarFallback className="bg-indigo-200 text-indigo-800">
                  {userDisplayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Comparte tu experiencia de viaje..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="border-0 bg-gray-50 text-base p-4 mb-4"
                />
                {imagePreview && (
                  <div className="mb-2 relative">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-contain rounded-lg bg-gray-100" />
                    <button
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {/* City Dropdown for Post */}
                {showCityDropdown && (
                  <div className="mb-3 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar ciudad..."
                        value={citySearchQuery}
                        onChange={(e) => setCitySearchQuery(e.target.value)}
                        className="pl-10 pr-4 bg-gray-50 border-gray-200"
                        autoFocus
                      />
                    </div>
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                      {filteredCities.map((city) => (
                        <button
                          key={city.id}
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center justify-between transition-colors"
                          onClick={() => selectPostCity(city.id, city.nombre)}
                        >
                          <span className="font-medium">{city.nombre}</span>
                        </button>
                      ))}
                      {filteredCities.length === 0 && (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          No se encontraron ciudades
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Interest Dropdown for Post */}
                {showInteresDropdown && intereses.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-2">Selecciona un interés para tu publicación:</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {intereses.map((interes) => (
                        <Badge
                          key={interes.id}
                          className="cursor-pointer px-3 py-1.5 transition-colors bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700"
                          onClick={() => selectPostInteres(interes.id, interes.tipo)}
                        >
                          {interes.tipo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600"
                      onClick={() => document.getElementById("fileInput")?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Foto
                    </Button>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${postCiudadNombre ? 'text-indigo-600' : 'text-gray-600'}`}
                      onClick={() => setShowCityDropdown((prev) => !prev)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {postCiudadNombre || 'Ubicación'}
                      {postCiudadNombre && (
                        <X 
                          className="h-3 w-3 ml-1" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setPostCiudadId(null)
                            setPostCiudadNombre("")
                          }}
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${postInteresNombre ? 'text-purple-600' : 'text-gray-600'}`}
                      onClick={() => setShowInteresDropdown((prev) => !prev)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {postInteresNombre || 'Interés'}
                      {postInteresNombre && (
                        <X 
                          className="h-3 w-3 ml-1" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setPostInteresId(null)
                            setPostInteresNombre("")
                          }}
                        />
                      )}
                    </Button>
                  </div>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handlePublish}
                    disabled={!newPost.trim()}
                  >
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barra de búsqueda y filtros */}
        <Card className="border-indigo-100 shadow-md mb-8">
          <CardContent className="pt-6">
            {/* Búsqueda principal */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por texto, usuario, ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-indigo-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Botón para mostrar/ocultar filtros */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                {(selectedFilterCityId || selectedIntereses.length > 0) && (
                  <Badge className="ml-2 bg-indigo-600 text-white text-xs">
                    {(selectedFilterCityId ? 1 : 0) + selectedIntereses.length}
                  </Badge>
                )}
              </Button>
              {(selectedFilterCityId || selectedIntereses.length > 0 || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Panel de filtros expandible */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                {/* Filtro por ciudades */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Filtrar por ciudad
                  </h4>
                  
                  {/* Ciudad seleccionada */}
                  {selectedFilterCityName && (
                    <div className="mb-2">
                      <Badge className="bg-indigo-600 text-white px-3 py-1.5">
                        {selectedFilterCityName}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => {
                            setSelectedFilterCityId(null)
                            setSelectedFilterCityName("")
                          }}
                        />
                      </Badge>
                    </div>
                  )}
                  
                  {/* Dropdown para seleccionar ciudad */}
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar ciudad para filtrar..."
                        value={filterCityQuery}
                        onChange={(e) => {
                          setFilterCityQuery(e.target.value)
                          setShowFilterCityDropdown(true)
                        }}
                        onFocus={() => setShowFilterCityDropdown(true)}
                        className="pl-10 pr-4 bg-gray-50 border-gray-200"
                      />
                    </div>
                    {showFilterCityDropdown && filterCityQuery && (
                      <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                        {filteredCitiesForFilter.map((city) => (
                          <button
                            key={city.id}
                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center justify-between transition-colors"
                            onClick={() => selectFilterCity(city.id, city.nombre)}
                          >
                            <span className="font-medium">{city.nombre}</span>
                          </button>
                        ))}
                        {filteredCitiesForFilter.length === 0 && (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            No se encontraron ciudades
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Filtro por intereses */}
                {intereses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Intereses
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {intereses.map(interes => (
                        <Badge
                          key={interes.id}
                          className={`cursor-pointer px-3 py-1.5 transition-colors ${selectedIntereses.includes(interes.id)
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          onClick={() => toggleInteres(interes.id)}
                        >
                          {interes.tipo}
                          {selectedIntereses.includes(interes.id) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experiences Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : experiences.length > 0 ? (
          <div className="space-y-6">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience.publicacion_id}
                experience={experience}
                currentUserId={currentUserId}
                onLike={handleLike}
                onComment={handleComment}
                onEdit={handleEdit}
                onDelete={handleDeleteConfirm}
                onImageClick={(imageUrl: string) => {
                  setViewerImage(imageUrl)
                  setImageViewerOpen(true)
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="border-indigo-100">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No hay experiencias aún</h3>
              <p className="text-gray-600 text-center">Sé el primero en compartir una experiencia</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar publicación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Escribe tu experiencia..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveEdit}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>¿Eliminar publicación?</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600 py-4">
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta publicación?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Viewer Dialog */}
        <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
          <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0 bg-black/95">
            <div className="relative flex items-center justify-center min-h-[50vh]">
              {viewerImage && (
                <img
                  src={viewerImage}
                  alt="Imagen ampliada"
                  className="max-w-full max-h-[85vh] object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Load More */}
        {experiences.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setPage(page + 1)}
            >
              Cargar más experiencias
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ExperienceCard({ experience, currentUserId, onLike, onComment, onEdit, onDelete, onImageClick }: {
  experience: any
  currentUserId: number | undefined
  onLike: (id: number) => void
  onComment: (id: number, mensaje: string) => void
  onEdit: (experience: any) => void
  onDelete: (id: number) => void
  onImageClick: (imageUrl: string) => void
}) {
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState("")

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(experience.publicacion_id, commentText)
      setCommentText("")
      setShowCommentInput(false)
    }
  }

  const isOwner = currentUserId && experience.usuario_id === currentUserId

  // Get the city name from the ciudad relation
  const cityName = experience.ciudad?.nombre

  return (
    <Card className="border-indigo-100 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={experience.usuario?.imagen_perfil_id || "/placeholder.svg"} />
              <AvatarFallback className="bg-indigo-200 text-indigo-800">
                {experience.usuario?.nombre?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {experience.usuario?.nombre} {experience.usuario?.apellido}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {cityName && (
                  <>
                    <MapPin className="h-3 w-3" />
                    <span>{cityName}</span>
                    <span>•</span>
                  </>
                )}
                <Clock className="h-3 w-3" />
                <span>{new Date(experience.fecha_creacion).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onEdit(experience)}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(experience.publicacion_id)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{experience.descripcion}</p>

        {experience.imagenes && experience.imagenes.length > 0 && (
          <div className="rounded-lg overflow-hidden relative group cursor-pointer"
            onClick={() => {
              const imageUrl = experience.imagenes[0].imagen_base64
                ? `data:${experience.imagenes[0].mime_type || 'image/jpeg'};base64,${experience.imagenes[0].imagen_base64}`
                : experience.imagenes[0].url || "/placeholder.svg"
              onImageClick(imageUrl)
            }}
          >
            <img
              src={
                experience.imagenes[0].imagen_base64
                  ? `data:${experience.imagenes[0].mime_type || 'image/jpeg'};base64,${experience.imagenes[0].imagen_base64}`
                  : experience.imagenes[0].url || "/placeholder.svg"
              }
              alt="Experiencia de viaje"
              className="w-full max-h-96 object-contain bg-gray-100"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
          </div>
        )}

        <div className="flex items-center pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-600 ${experience.liked ? 'text-red-600' : 'hover:text-red-600'}`}
              onClick={() => onLike(experience.publicacion_id)}
            >
              <Heart className={`h-4 w-4 mr-1 ${experience.liked ? 'fill-current' : ''}`} />
              {experience.me_gusta || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-indigo-600"
              onClick={() => setShowCommentInput(!showCommentInput)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {experience.comentarios?.length || 0}
            </Button>
          </div>
        </div>

        {/* Comment input */}
        {showCommentInput && (
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Escribe un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
            >
              Comentar
            </Button>
          </div>
        )}

        {/* Comments list */}
        {experience.comentarios && experience.comentarios.length > 0 && (
          <div className="space-y-2 pt-2">
            {experience.comentarios.slice(0, 3).map((comentario: any) => (
              <div key={comentario.id} className="flex gap-2 text-sm">
                <span className="font-semibold">{comentario.usuario?.nombre}:</span>
                <span className="text-gray-700">{comentario.mensaje}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ExperienciasPage
