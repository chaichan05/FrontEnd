import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  // isActive คือ function ที่ตรวจสอบว่าเส้นทางปัจจุบันตรงกับเส้นทางที่กำหนดหรือไม่ โดยใช้ useLocation เพื่อเข้าถึงเส้นทางปัจจุบัน
  const isActive = (path) => location.pathname === path;

  //linkClass คือ function ที่สร้างคลาสสำหรับลิงก์ โดยจะเพิ่มคลาส "text-white" เมื่อเส้นทางตรงกับลิงก์นั้น และจะใช้สีเทาและเอฟเฟกต์ hover เมื่อไม่ตรง
  const linkClass = (path) => {
    const baseClass = "font-semibold text-base relative pb-2 transition-colors duration-300";
    const activeClass = isActive(path) 
      ? "text-white" 
      : "text-gray-200 hover:text-white";
    return `${baseClass} ${activeClass}`;
  };

  // underlineStyle คื function ที่สร้างสไตล์สำหรับเส้นใต้ของลิงก์ โดยจะขยายเต็มความกว้างเมื่อเส้นทางตรงกับลิงก์นั้น และจะหดกลับเมื่อไม่ตรง
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