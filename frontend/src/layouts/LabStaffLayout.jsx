import { Outlet } from 'react-router-dom';
import LabStaffNavbar from '../pages/labStaff/LabStaffNavbar';

export default function LabStaffLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <LabStaffNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}