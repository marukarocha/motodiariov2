export const Sidebar = () => {
    return (
      <aside className="w-64 bg-gray-800">
        {/* Conteúdo da barra lateral */}
        <ul className="p-4">
          <li><a href="#" className="block py-2">Dashboard</a></li>
          <li><a href="#" className="block py-2">Corridas</a></li>
          <li><a href="#" className="block py-2">Pilotos</a></li>
          {/* ... */}
        </ul>
      </aside>
    );
  };