import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"

// Importar todas las páginas
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegistroPage from "./pages/RegistroPage"
import PerfilPage from "./pages/PerfilPage"
import EventosPage from "./pages/EventosPage"
import CrearEventoPage from "./pages/CrearEventoPage"
import EventoChatPage from "./pages/EventoChatPage"
import VerificarIdentidadPage from "./pages/VerificarIdentidadPage"
import ItinerarioResultadoPage from "./pages/ItinerarioResultadoPage"
import ExperienciasPage from "./pages/ExperienciasPage"
import BuscarItinerarioPage from "./pages/BuscarItinerarioPage"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import ChatGeneralEventoPage from "./pages/ChatGeneralEventoPage"

function AppContent() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/eventos" element={<EventosPage />} />
            <Route path="/crear-evento" element={<CrearEventoPage />} />
            <Route path="/editar-evento/:id" element={<CrearEventoPage />} />
            <Route path="/eventos/chat/:id" element={<EventoChatPage />} />
            <Route path="/verificar-identidad" element={<VerificarIdentidadPage />} />
            <Route path="/itinerario/resultado" element={<ItinerarioResultadoPage />} />
            <Route path="/experiencias" element={<ExperienciasPage />} />
            <Route path="/buscar-itinerario" element={<BuscarItinerarioPage />} />
            <Route path="/chat" element={<ChatGeneralEventoPage />} />

      </Routes>
      <Toaster />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="travel-social-theme">
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App
