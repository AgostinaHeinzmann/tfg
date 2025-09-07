import type React from "react";
import { useState, useEffect } from "react";
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
  Globe,
  User,
  Map,
  Calendar,
  Heart,
  MessageCircle,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react";
import { auth } from "../../../firebase/firebase.config";

interface NavbarProps {
  isLoggedIn: boolean; // Puedes usar esto si decides manejar el estado de autenticación desde props
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(3); // Simulamos notificaciones
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

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

  return (
    <nav className="bg-white border-b border-indigo-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-indigo-900">
              TravelSocial
            </span>
          </Link>

          {/* Desktop Navigation - solo si hay usuario */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <Link key={item.name} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        isActive
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
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
                    className="flex items-center space-x-2 hover:bg-indigo-50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoURL || "/placeholder.svg"}
                        alt={user.displayName || "Usuario"}
                      />
                      <AvatarFallback className="bg-indigo-200 text-indigo-800">
                        {user.displayName
                          ? user.displayName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">
                      {user.displayName
                        ? user.displayName.split(" ")[0]
                        : "Usuario"}
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
                  <DropdownMenuItem onClick={() => navigate("/configuracion")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
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
          )}

          {/* Mobile menu button - solo si hay usuario */}
          {user && (
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600"
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
          <div className="md:hidden border-t border-indigo-100 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm opacity-75">
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
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link
                  to="/perfil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName || "Usuario"}
                    />
                    <AvatarFallback className="bg-indigo-200 text-indigo-800">
                      {user.displayName
                        ? user.displayName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.displayName || "Usuario"}
                    </div>
                    <div className="text-sm text-gray-500">Ver perfil</div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
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
