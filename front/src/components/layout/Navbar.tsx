import React from "react";

interface NavbarProps {
  isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-b from-indigo-50 ">
      <div className="flex items-center gap-2">
        {/* Logo */}
        <img src="/imagenes/Agos.png" alt="Logo" className="h-8 w-8" />
        <span className="text-xl font-bold text-indigo-900">TravelSocial</span>
      </div>
      {isLoggedIn && (
        <div className="flex items-center gap-6">
          <button className="text-cute-coral font-medium hover:underline">Itinerarios</button>
          <button className="text-cute-coral font-medium hover:underline">Eventos</button>
          <button className="text-cute-coral font-medium hover:underline">Perfil</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;