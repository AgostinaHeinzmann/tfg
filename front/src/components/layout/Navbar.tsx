import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  User,
  Map,
  Calendar,
  Heart,
  MessageCircle,
  LogOut,
  Menu,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";
import { auth } from "../../../firebase/firebase.config";
import { getUnreadCount } from "../../services/chatService";
import { getUserProfile } from "../../services/authService";

const NOTIFICATION_POLLING_INTERVAL = 30000; // 30 segundos

// Interface para datos del usuario desde el backend
interface BackendUser {
  nombre: string;
  apellido: string;
  imagen_perfil_id?: string | null;
  email: string;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setBackendUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch backend user data when Firebase user changes
  useEffect(() => {
    const fetchBackendUser = async () => {
      if (user) {
        try {
          const response = await getUserProfile();
          if (response && typeof response === 'object' && 'success' in response && 'user' in response && response.success && response.user) {
            setBackendUser(response.user as BackendUser);
          }
        } catch (error) {
          console.error("Error fetching backend user:", error);
        }
      }
    };
    fetchBackendUser();

    // Escuchar evento personalizado para refrescar datos del usuario
    const handleUserDataUpdated = () => {
      fetchBackendUser();
    };
    window.addEventListener('userDataUpdated', handleUserDataUpdated);
    
    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
    };
  }, [user]);

  // Helper to get display name - prioritize backend data
  const getDisplayName = () => {
    if (backendUser?.nombre) {
      return `${backendUser.nombre} ${backendUser.apellido || ''}`.trim();
    }
    return user?.displayName || "Usuario";
  };

  // Helper to get first name for navbar display
  const getFirstName = () => {
    if (backendUser?.nombre) {
      return backendUser.nombre;
    }
    return user?.displayName?.split(" ")[0] || "Usuario";
  };

  // Helper to get avatar initials
  const getAvatarInitials = () => {
    if (backendUser?.nombre) {
      const initials = backendUser.nombre[0] + (backendUser.apellido?.[0] || '');
      return initials.toUpperCase();
    }
    if (user?.displayName) {
      return user.displayName.split(" ").map((n: string) => n[0]).join("");
    }
    return "U";
  };

  // Helper to get profile image - prioritize backend data
  const getProfileImage = () => {
    if (backendUser?.imagen_perfil_id) {
      return backendUser.imagen_perfil_id;
    }
    return user?.photoURL || "/placeholder.svg";
  };

  // Fetch unread notifications count
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const count = await getUnreadCount();
      setNotifications(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user]);

  // Initial fetch and polling for notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, NOTIFICATION_POLLING_INTERVAL);
      return () => clearInterval(interval);
    } else {
      setNotifications(0);
    }
  }, [user, fetchNotifications]);

  // Detectar tipo de página
  const isAuthPage = location.pathname === "/login" || location.pathname === "/registro";

  const navItems = [
    {
      name: "Feed",
      path: "/experiencias",
      icon: Heart,
      description: "Experiencias de viaje",
    },
    {
      name: "Itinerarios",
      path: "/buscar-itinerario",
      icon: Map,
      description: "Planifica tu viaje",
    },
    {
      name: "Eventos",
      path: "/eventos",
      icon: Calendar,
      description: "Conecta con viajeros",
    },
    {
      name: "Chat",
      path: "/chat",
      icon: MessageCircle,
      description: "Mensajes",
    },
  ];

  const isActivePath = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  // Estilos del navbar - mismo color que el footer
  const navStyles = "bg-indigo-900 sticky top-0 z-50"; 

  return (
    <nav className={navStyles}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/imagenes/logowindow.png" 
              alt="Logo" 
              className="h-12 w-12 transition-transform group-hover:scale-105" 
            />
            <span className="text-2xl md:text-3xl font-bold text-white font-brand">
              TravelSocial
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            // Usuario logueado - navegación completa
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <Link key={item.name} to={item.path}>
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 text-white transition-colors ${
                        isActive
                          ? "bg-white/25"
                          : "hover:bg-white/20 active:bg-white/30"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      {item.name === "Chat" && notifications > 0 && (
                        <Badge className="bg-red-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center">
                          {notifications}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
              {/* Menú de usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-white hover:bg-white/20 active:bg-white/30 ml-2"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-white/30">
                      <AvatarImage
                        src={getProfileImage()}
                        alt={getDisplayName()}
                      />
                      <AvatarFallback className="bg-white/20 text-white">
                        {getAvatarInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {getFirstName()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : isAuthPage ? (
            // Página de login/registro - no mostrar botones, solo el logo
            null
          ) : (
            // Usuario no logueado en homepage - botones de auth
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                className="hidden sm:flex text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate("/login")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Button>
              <Button 
                className="bg-white text-indigo-900 hover:bg-indigo-100 font-semibold"
                onClick={() => navigate("/registro")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registrarse
              </Button>
            </div>
          )}

          {/* Mobile menu button - solo si hay usuario logueado */}
          {user && !isAuthPage && (
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation - solo si hay usuario */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-white ${
                      isActive
                        ? "bg-white/20"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-white/70">
                        {item.description}
                      </div>
                    </div>
                    {item.name === "Chat" && notifications > 0 && (
                      <Badge className="bg-red-500 text-white text-xs ml-auto">
                        {notifications}
                      </Badge>
                    )}
                  </Link>
                );
              })}

              {/* Menú de usuario en mobile */}
              <div className="pt-4 mt-4 border-t border-white/20">
                <Link
                  to="/perfil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-white hover:bg-white/10"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-white/30">
                    <AvatarImage
                      src={getProfileImage()}
                      alt={getDisplayName()}
                    />
                    <AvatarFallback className="bg-white/20 text-white">
                      {getAvatarInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {getDisplayName()}
                    </div>
                    <div className="text-sm text-white/70">Ver perfil</div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start mt-2 text-red-300 hover:text-red-200 hover:bg-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
