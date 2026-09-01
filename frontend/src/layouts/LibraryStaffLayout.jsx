import { Outlet } from 'react-router-dom';
import LibraryStaffNavbar from '../pages/libraryStaff/LibraryStaffNavbar';

export default function LibraryStaffLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <LibraryStaffNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}