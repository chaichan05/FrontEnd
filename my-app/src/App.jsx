import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './component/navbet';
import UsersComponent from './component/users/UsersComponent';
import DepartmentComponent from './component/department';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/users" />} />

        <Route path="/users" element={<UsersComponent />} />
        <Route path="/department" element={<DepartmentComponent />} />

        <Route path="*" element={<h1 className="text-center mt-10">404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;