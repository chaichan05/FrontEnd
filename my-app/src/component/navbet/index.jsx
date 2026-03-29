import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => {
    const baseClass = "font-semibold text-base relative pb-2 transition-colors duration-300";
    const activeClass = isActive(path) 
      ? "text-white" 
      : "text-gray-200 hover:text-white";
    return `${baseClass} ${activeClass}`;
  };

  const underlineStyle = (path) => ({
    content: '""',
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '2px',
    backgroundColor: 'white',
    transform: isActive(path) ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease-in-out'
  });

  return (
    <div className="bg-[#6ebfd5] text-gray-200 p-4 flex gap-8 sticky top-0 z-10 shadow-2xl">
      <Link 
        to="/department" 
        className={linkClass("/department")}
        style={{
          position: 'relative'
        }}
      >
        Departments
        <span style={underlineStyle("/department")} />
      </Link>
      <Link 
        to="/users" 
        className={linkClass("/users")}
        style={{
          position: 'relative'
        }}
      >
        Users
        <span style={underlineStyle("/users")} />
      </Link>
    </div>
  );
};

export default Navbar;