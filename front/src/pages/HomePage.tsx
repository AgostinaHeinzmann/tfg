import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Calendar, MessageCircle, Shield, UserPlus, Users, Camera, Trees, ChevronLeft, ChevronRight, Sparkles, Heart, LogIn } from "lucide-react"
import { auth } from "../../firebase/firebase.config"

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [currentFeature, setCurrentFeature] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: Trees,
      title: "Itinerarios Personalizados",
      description: "Busca itinerarios basados en tus intereses",
      details: "Busca itinerarios basados en tus intereses, destino y fechas de viaje para aprovechar al máximo tu experiencia.",
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: Calendar,
      title: "Eventos Exclusivos",
      description: "Descubre y únete a eventos",
      details: "Descubre y únete a eventos creados por otros viajeros que comparten tus intereses.",
      color: "from-violet-400 to-purple-500"
    },
    {
      icon: Shield,
      title: "Sistema de Seguridad",
      description: "Verificación de edad para eventos",
      details: "Sistema de escaneo de DNI y validación de edad para garantizar la seguridad al inscribirse en eventos con restricciones.",
      color: "from-amber-400 to-orange-500"
    },
    {
      icon: Users,
      title: "Comunidad de Viajeros",
      description: "Conecta con otros viajeros",
      details: "Conecta con otros viajeros, comparte experiencias y haz nuevas amistades durante tus aventuras.",
      color: "from-pink-400 to-rose-500"
    },
    {
      icon: MessageCircle,
      title: "Chat por Evento",
      description: "Coordina detalles con otros participantes",
      details: "Coordina detalles con otros participantes a través de nuestro chat interno asociado a cada evento.",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: Camera,
      title: "Feed de Experiencias",
      description: "Comparte fotos y experiencias",
      details: "Comparte fotos, opiniones y consejos en nuestro feed geolocalizado y descubre las experiencias de otros viajeros.",
      color: "from-indigo-400 to-violet-500"
    },
  ]

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length)
  }

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)
  }

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [features.length])

  // Si el usuario está logueado, redirigir al feed
  useEffect(() => {
    if (user) {
      navigate("/experiencias")
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-indigo-50 -mt-20">
      {/* Hero Section */}
      <div id="hero" className="relative min-h-screen overflow-hidden pt-20">
        {/* Background con gradiente y elementos decorativos */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900">
          {/* Elementos decorativos animados */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Imágenes flotantes decorativas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Columna izquierda */}
          <img 
            src="/imagenes/trekking.jpg" 
            alt="Trekking" 
            className="absolute top-32 left-[3%] w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-2xl animate-float-slow opacity-80 -rotate-6 hidden md:block"
          />
          <img 
            src="/imagenes/brasil.jpg" 
            alt="Brasil" 
            className="absolute top-[42%] left-[2%] w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-2xl animate-float opacity-75 rotate-3 hidden lg:block"
          />
          <img 
            src="/imagenes/roma.jpg" 
            alt="Roma" 
            className="absolute bottom-[15%] left-[8%] w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-2xl animate-float-slow opacity-80 rotate-6 hidden md:block"
          />

          <img 
            src="/imagenes/nywithfriends.jpg" 
            alt="New York with Friends" 
            className="absolute bottom-[40%] left-[15%] w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover shadow-2xl animate-float-slow opacity-80 rotate-6 hidden md:block"
          />
          
          {/* Columna derecha */}
          <img 
            src="/imagenes/paris.avif" 
            alt="Paris" 
            className="absolute top-28 right-[3%] w-32 h-32 md:w-44 md:h-44 rounded-2xl object-cover shadow-2xl animate-float-slow opacity-85 rotate-3"
          />
          <img 
            src="/imagenes/buceo.jpg" 
            alt="Buceo" 
            className="absolute top-[38%] right-[15%] w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-2xl animate-float opacity-75 -rotate-6 hidden lg:block"
          />
          <img 
            src="/imagenes/tokio.jpg" 
            alt="Tokio" 
            className="absolute top-[45%] right-[2%] w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-2xl animate-float-slow opacity-75 rotate-12 hidden lg:block"
          />
          <img 
            src="/imagenes/party.jpg" 
            alt="Party" 
            className="absolute bottom-[15%] right-[6%] w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-2xl animate-float opacity-80 -rotate-3 hidden md:block"
          />
          
          {/* Centro-izquierda adicional */}
          <img 
            src="/imagenes/travelwithfriends.jpg" 
            alt="Travel with Friends" 
            className="absolute top-[60%] right-[20%] w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover shadow-2xl animate-float opacity-70 rotate-6 hidden lg:block"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-16 md:pt-24 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-white/90 text-sm font-medium">Tu próxima aventura comienza aquí</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
                Explora, Conecta, 
                <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Viaja
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-10 text-indigo-100/90 max-w-2xl mx-auto leading-relaxed">
                Descubre destinos increíbles, busca itinerarios personalizados y conecta con otros viajeros
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-900 hover:bg-indigo-100 font-semibold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 min-w-[220px]"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Iniciar sesión
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white font-semibold text-lg px-8 py-6 rounded-full backdrop-blur-sm transition-all hover:scale-105 min-w-[220px]"
                  onClick={() => navigate("/registro")}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Registrarse
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#EEF2FF"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-6">
              Todo lo que necesitas para tu próxima aventura
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Descubre todas las herramientas y funciones que te ayudarán a planificar el viaje perfecto
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index}
                  className={`border-0 shadow-lg card-hover-effect cursor-pointer overflow-hidden group animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-indigo-900 group-hover:text-indigo-700 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.details}
                    </p>
                  </CardContent>
                  {/* Hover effect bar */}
                  <div className={`h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
                </Card>
              )
            })}
          </div>

          {/* Feature Carousel for Mobile */}
          <div className="mt-16 lg:hidden">
            <div className="relative bg-white rounded-3xl shadow-xl p-8 overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${features[currentFeature].color}`}></div>
              
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={prevFeature}
                  className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-indigo-700" />
                </button>
                
                <div className="flex gap-2">
                  {features.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentFeature(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentFeature ? 'w-8 bg-indigo-600' : 'bg-indigo-200'
                      }`}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={nextFeature}
                  className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-indigo-700" />
                </button>
              </div>

              <div className="text-center">
                {(() => {
                  const Icon = features[currentFeature].icon
                  return (
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${features[currentFeature].color} flex items-center justify-center mx-auto mb-6 animate-pulse-glow`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                  )
                })()}
                <h3 className="text-2xl font-bold text-indigo-900 mb-3">
                  {features[currentFeature].title}
                </h3>
                <p className="text-gray-600">
                  {features[currentFeature].details}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Sobre Nosotros
              </h2>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/30 shadow-xl animate-pulse-glow">
                    <img 
                      src="/imagenes/agostorre.jpeg" 
                      alt="Agostina" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <p className="text-lg md:text-xl text-indigo-100 leading-relaxed mb-6">
                    TravelSocial nació de una idea simple: <span className="text-white font-semibold">nadie debería perderse una experiencia increíble por no tener con quién ir</span>. 
                  </p>
                  <p className="text-indigo-200/90 leading-relaxed mb-6">
                    Creemos que viajar es mejor cuando se comparte. Por eso construimos una plataforma donde puedes encontrar compañeros de viaje, descubrir eventos únicos y crear memorias que durarán toda la vida.
                  </p>
                  <p className="text-indigo-200/90 leading-relaxed">
                    Cada función está diseñada para ayudarte a salir al mundo, conocer gente nueva y vivir experiencias auténticas, sin importar si viajas solo o en grupo.
                  </p>
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Comunidad</h3>
                <p className="text-indigo-200/80 text-sm">Conectamos viajeros de todo el mundo</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Seguridad</h3>
                <p className="text-indigo-200/80 text-sm">Tu tranquilidad es nuestra prioridad</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Pasión</h3>
                <p className="text-indigo-200/80 text-sm">Amamos lo que hacemos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="cta" className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-6">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Únete a miles de viajeros que ya están explorando el mundo y creando conexiones únicas.
          </p>
          <Button 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg px-10 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            onClick={() => navigate("/registro")}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Comenzar ahora
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
