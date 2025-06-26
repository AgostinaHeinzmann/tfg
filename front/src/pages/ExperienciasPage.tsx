import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, MapPin, Heart, MessageCircle, Share2, MoreHorizontal, Clock, Globe } from "lucide-react"

const ExperienciasPage: React.FC = () => {
  const navigate = useNavigate()
  const [newPost, setNewPost] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("Todos")

  const filters = ["Todos", "Barcelona", "Madrid", "Cultura", "Gastronomía", "Aventura"]

  // Datos de ejemplo para las experiencias
  const experiences = [
    {
      id: "1",
      user: {
        name: "María García",
        avatar: "/placeholder.svg?height=40&width=40",
        location: "Barcelona, España",
      },
      content:
        "¡La Sagrada Familia es impresionante! Definitivamente vale la pena la visita. Recomiendo comprar las entradas con anticipación para evitar las filas.",
      image: "/imagenes/sagradafamilia.jpeg?height=300&width=500",
      timestamp: "Hace 2 horas",
      likes: 24,
      comments: 8,
      tags: ["Cultura", "Barcelona"],
    },
    {
      id: "2",
      user: {
        name: "Carlos Rodríguez",
        avatar: "/placeholder.svg?height=40&width=40",
        location: "Madrid, España",
      },
      content:
        "Increíble experiencia en el Museo del Prado. Las obras de Velázquez son simplemente espectaculares. Pasé toda la mañana allí y no me di cuenta del tiempo.",
      image: "/imagenes/prado.webp?height=300&width=500",
      timestamp: "Hace 5 horas",
      likes: 18,
      comments: 12,
      tags: ["Cultura", "Madrid"],
    },
    {
      id: "3",
      user: {
        name: "Ana Martínez",
        avatar: "/placeholder.svg?height=40&width=40",
        location: "Valencia, España",
      },
      content:
        "El mercado central de Valencia es un paraíso para los amantes de la gastronomía. Probé la paella más auténtica de mi vida. ¡Altamente recomendado!",
      image: "/imagenes/mercado.jpg?height=300&width=500",
      timestamp: "Hace 1 día",
      likes: 42,
      comments: 15,
      tags: ["Gastronomía", "Valencia"],
    },
  ]

  const handlePublish = () => {
    if (newPost.trim()) {
      // Aquí iría la lógica para publicar la experiencia
      setNewPost("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-indigo-900">Experiencias</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">Descubre y comparte experiencias de viaje con la comunidad</p>
        </div>

        {/* Create Post */}
        <Card className="border-indigo-100 shadow-md mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Tu avatar" />
                <AvatarFallback className="bg-indigo-200 text-indigo-800">TU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Comparte tu experiencia de viaje..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="border-0 bg-gray-50 text-base p-4 mb-4"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Camera className="h-4 w-4 mr-2" />
                      Foto
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ubicación
                    </Button>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handlePublish} disabled={!newPost.trim()}>
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => (
            <Badge
              key={filter}
              className={`cursor-pointer px-4 py-2 ${
                selectedFilter === filter
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Experiences Feed */}
        <div className="space-y-6">
          {experiences.map((experience) => (
            <Card key={experience.id} className="border-indigo-100 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={experience.user.avatar || "/placeholder.svg"} alt={experience.user.name} />
                      <AvatarFallback className="bg-indigo-200 text-indigo-800">
                        {experience.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{experience.user.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{experience.user.location}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{experience.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{experience.content}</p>

                {experience.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={experience.image || "/placeholder.svg"}
                      alt="Experiencia de viaje"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {experience.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-indigo-700 border-indigo-200">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                      <Heart className="h-4 w-4 mr-1" />
                      {experience.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {experience.comments}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            Cargar más experiencias
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ExperienciasPage
