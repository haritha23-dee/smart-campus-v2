import { Outlet } from 'react-router-dom';
import AdminNavbar from '../pages/admin/AdminNavbar';

export default function AdminLayout() {
  return (
    <div className="admin-shell min-h-screen bg-canvas">
      <AdminNavbar />
      <div className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </div>
    </div>
  );
}