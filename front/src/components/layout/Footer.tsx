import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { auth } from "../../../firebase/firebase.config"

function Footer() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  // Detectar tipo de página
  const isHomePage = location.pathname === "/"
  const isAuthPage = location.pathname === "/login" || location.pathname === "/registro"
  
  // Mostrar contenido completo solo en homepage cuando no está logueado
  const showFullContent = isHomePage && !user && !isAuthPage

  const handleNavigation = (sectionId: string) => {
    if (location.pathname !== "/") {
      // Si no estamos en la homepage, navegar primero a ella
      navigate("/")
      // Esperar a que la página cargue y luego hacer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } else {
      // Si ya estamos en la homepage, solo hacer scroll
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const footerLinks = [
    { name: "Inicio", sectionId: "hero" },
    { name: "¿Qué tiene TravelSocial?", sectionId: "features" },
    { name: "Sobre nosotros", sectionId: "about" },
    { name: "Unite", sectionId: "cta" },
  ]

  return (
    <footer className="bg-indigo-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {showFullContent ? (
            // Contenido completo para homepage sin usuario logueado
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              {/* Logo y descripción */}
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center mb-4">
                  <img src="/imagenes/logowindow.png" alt="Logo" className="h-14 w-14 mr-3" />
                  <span className="text-3xl font-bold font-brand">TravelSocial</span>
                </div>
                <p className="text-indigo-300 text-sm max-w-xs text-center md:text-left">
                  Explora, conecta y viaja. Tu próxima aventura comienza aquí.
                </p>
              </div>

              {/* Links de navegación */}
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-white font-semibold mb-4">Navegación</h3>
                <ul className="space-y-2">
                  {footerLinks.map((link) => (
                    <li key={link.sectionId}>
                      <button
                        onClick={() => handleNavigation(link.sectionId)}
                        className="text-indigo-300 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contacto o redes */}
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-white font-semibold mb-4">Cuenta</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/login" className="text-indigo-300 hover:text-white transition-colors text-sm">
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link to="/registro" className="text-indigo-300 hover:text-white transition-colors text-sm">
                      Registrarse
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            // Contenido simplificado para usuario logueado o páginas de auth
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center mb-4">
                <img src="/imagenes/logowindow.png" alt="Logo" className="h-14 w-14 mr-3" />
                <span className="text-3xl font-bold font-brand">TravelSocial</span>
              </div>
              <p className="text-indigo-300 text-sm max-w-xs">
                Explora, conecta y viaja. Tu próxima aventura comienza aquí.
              </p>
            </div>
          )}

          <div className="border-t border-indigo-700 mt-10 pt-8 text-center text-indigo-400 text-sm">
            © 2026 TravelSocial. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer