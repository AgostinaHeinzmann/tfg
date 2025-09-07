import { Link } from "react-router-dom"


function Footer() {
  return (
      <footer className="bg-indigo-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <img src="/imagenes/Agos.png" alt="Logo" className="h-8 w-8 mr-2" />
                <span className="text-2xl font-bold">TravelSocial</span>
              </div>
            </div>
            <div className="border-t border-cute-beige mt-8 pt-8 text-center text-indigo-400 text-sm">
              © 2025 TravelSocial. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer> 
       )
}

export default Footer