import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, MapPin, Heart, MessageCircle, Share2, MoreHorizontal, Clock, Loader2 } from "lucide-react"
import { getFeed, createFeed, likePublication, commentPublication } from "@/services/feedService"
import { getFilters } from "@/services/filtrosService"
import { auth } from "../../firebase/firebase.config"
import { showToast } from "@/lib/toast-utils"
import { loadFromLocalStorage } from "@/lib/utils"

const ExperienciasPage: React.FC = () => {
  const navigate = useNavigate()
  const [newPost, setNewPost] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ciudades, setCiudades] = useState<Array<{ id: number; nombre: string }>>([])
  const [selectedCiudad, setSelectedCiudad] = useState<number | null>(null)
  const [page, setPage] = useState(0)

  // Cargar ciudades para el filtro
  useEffect(() => {
    const loadCiudades = async () => {
      try {
        const response: any = await getFilters()
        if (response.success && response.data) {
          setCiudades(response.data.ciudades || [])
        }
      } catch (error) {
        console.error("Error loading cities:", error)
      }
    }
    loadCiudades()
  }, [])

  // Cargar publicaciones
  const loadFeed = async () => {
    setLoading(true)
    try {
      const filters: any = { page, size: 10 }
      if (selectedCiudad) filters.ciudad_id = selectedCiudad

      const response: any = await getFeed(filters)
      setExperiences(response.data || [])
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
  }, [page, selectedCiudad])

  // Manejar subida de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
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

      if (selectedCiudad) feedData.ciudad_id = selectedCiudad

      // Por ahora no manejamos imágenes, pero se puede agregar imagenesIds aquí
      // if (selectedImage) { ... upload image first, then add to feedData.imagenes }

      await createFeed(feedData)
      showToast.success("Publicado", "Tu experiencia se publicó exitosamente")

      // Limpiar formulario
      setNewPost("")
      setSelectedImage(null)
      setImagePreview(null)
      setLocation("")
      setShowLocationInput(false)

      // Recargar feed
      loadFeed()
    } catch (error: any) {
      console.error("Error creating post:", error)
      showToast.error("Error al publicar", error.message || "No se pudo publicar tu experiencia")
    }
  }

  // Manejar like
  const handleLike = async (publicacionId: number) => {
    try {
      await likePublication(publicacionId)
      // Actualizar el conteo localmente (optimistic update)
      setExperiences(experiences.map(exp =>
        exp.publicacion_id === publicacionId
          ? { ...exp, likes: (exp.likes || 0) + 1, liked: !exp.liked }
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
                <AvatarImage src={auth.currentUser?.photoURL || "/placeholder.svg"} />
                <AvatarFallback className="bg-indigo-200 text-indigo-800">
                  {auth.currentUser?.displayName?.charAt(0) || "U"}
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
                  <div className="mb-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  </div>
                )}
                {showLocationInput && (
                  <Input
                    placeholder="Ubicación (ej: Barcelona, España)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mb-2"
                  />
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
                      className="text-gray-600"
                      onClick={() => setShowLocationInput((prev) => !prev)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Ubicación
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

        {/* Filtros por ciudad */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Badge
              className={`cursor-pointer px-4 py-2 ${selectedCiudad === null
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              onClick={() => setSelectedCiudad(null)}
            >
              Todas las ciudades
            </Badge>
            {ciudades.map(ciudad => (
              <Badge
                key={ciudad.id}
                className={`cursor-pointer px-4 py-2 ${selectedCiudad === ciudad.id
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                onClick={() => setSelectedCiudad(ciudad.id)}
              >
                {ciudad.nombre}
              </Badge>
            ))}
          </div>
        </div>

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
                onLike={handleLike}
                onComment={handleComment}
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

function ExperienceCard({ experience, onLike, onComment }: {
  experience: any
  onLike: (id: number) => void
  onComment: (id: number, mensaje: string) => void
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

  return (
    <Card className="border-indigo-100 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={experience.usuario?.imagen_perfil || "/placeholder.svg"} />
              <AvatarFallback className="bg-indigo-200 text-indigo-800">
                {experience.usuario?.nombre?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {experience.usuario?.nombre} {experience.usuario?.apellido}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {experience.ciudad && (
                  <>
                    <MapPin className="h-3 w-3" />
                    <span>{experience.ciudad.nombre}</span>
                    <span>•</span>
                  </>
                )}
                <Clock className="h-3 w-3" />
                <span>{new Date(experience.fecha_creacion).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{experience.descripcion}</p>

        {experience.imagenes && experience.imagenes.length > 0 && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={experience.imagenes[0].url || "/placeholder.svg"}
              alt="Experiencia de viaje"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-600 ${experience.liked ? 'text-red-600' : 'hover:text-red-600'}`}
              onClick={() => onLike(experience.publicacion_id)}
            >
              <Heart className={`h-4 w-4 mr-1 ${experience.liked ? 'fill-current' : ''}`} />
              {experience.cant_likes || 0}
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
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600">
            <Share2 className="h-4 w-4" />
          </Button>
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
