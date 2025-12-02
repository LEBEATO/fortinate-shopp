import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

export const Navbar = () => {
  // Estado para controlar se o menu móvel está aberto ou fechado
  const [isOpen, setIsOpen] = useState(false);

  // Função para alternar o estado do menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="bg-gray-900 h-20 flex justify-center items-center text-lg sticky top-0 z-50">
        <div className="flex justify-between items-center h-20 w-full max-w-6xl px-6">
          <Link to="/" className="text-white text-3xl font-bold cursor-pointer no-underline">
            Fortinat Shop
          </Link>

          {/* Ícone do menu hambúrguer/fechar para telas pequenas */}
          <div className="md:hidden text-white text-3xl cursor-pointer" onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>

          {/* Menu para telas grandes */}
          <ul className="hidden md:flex items-center list-none text-center">
            <li>
              <Link to="/" className="text-white flex items-center no-underline px-4 h-20 hover:border-b-4 hover:border-purple-500 transition-all">
                Catálogo
              </Link>
            </li>
            <li>
              <Link to="/my-items" className="text-white flex items-center no-underline px-4 h-20 hover:border-b-4 hover:border-purple-500 transition-all">
                Meus Itens
              </Link>
            </li>
            <li>
              <Link to="/users" className="text-white flex items-center no-underline px-4 h-20 hover:border-b-4 hover:border-purple-500 transition-all">
                Comunidade
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-white no-underline bg-purple-600 hover:bg-purple-700 rounded-md py-2 px-6 ml-4 transition-all" title="Login / Perfil">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Menu para telas pequenas (hambúrguer) */}
      <ul
        className={
          isOpen
            ? 'md:hidden flex flex-col w-4/5 h-screen fixed top-20 left-0 bg-gray-800 transition-transform duration-500 ease-in-out z-40'
            : 'md:hidden flex flex-col w-4/5 h-screen fixed top-20 left-[-100%] bg-gray-800 transition-transform duration-500 ease-in-out z-40'
        }
      >
        <li className="w-full border-b border-gray-600"><Link to="/" className="block text-center text-white text-2xl py-8 no-underline hover:bg-gray-700" onClick={toggleMenu}>Catálogo</Link></li>
        <li className="w-full border-b border-gray-600"><Link to="/my-items" className="block text-center text-white text-2xl py-8 no-underline hover:bg-gray-700" onClick={toggleMenu}>Meus Itens</Link></li>
        <li className="w-full border-b border-gray-600"><Link to="/users" className="block text-center text-white text-2xl py-8 no-underline hover:bg-gray-700" onClick={toggleMenu}>Comunidade</Link></li>
        <li className="w-full mt-8"><Link to="/login" className="block text-center text-white text-2xl py-4 mx-8 rounded-md no-underline bg-purple-600 hover:bg-purple-700" onClick={toggleMenu}>Login / Perfil</Link></li>
      </ul>
    </>
  );
};