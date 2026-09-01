import { Outlet } from 'react-router-dom';
import StudentNavbar from '../pages/student/StudentNavbar';

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <StudentNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}