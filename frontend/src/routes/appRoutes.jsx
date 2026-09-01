import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import LoginPage from '../pages/LoginPage';
import PrivacyPage from '../pages/legal/PrivacyPage';
import TermsPage from '../pages/legal/TermsPage';
import ProtectedRoute from './protectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import AdminHome from '../pages/admin/AdminHome';
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import AdminDepartmentSetup from '../pages/admin/AdminDepartmentSetup';
import AdminUsageAnalytics from '../pages/admin/AdminUsageAnalytics';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

import StudentLayout from '../layouts/StudentLayout';
import StudentHome from '../pages/student/StudentHome';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import StudentDepartmentsPage from '../pages/student/StudentDepartmentsPage';
import StudentClassroomView from '../pages/student/StudentClassroomView';
import StudentLibraryPage from '../pages/student/StudentLibraryPage';
import StudentLabPage from '../pages/student/StudentLabPage';
import StudentHistoryPage from '../pages/student/StudentHistoryPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/legal/privacy" element={<PrivacyPage />} />
      <Route path="/legal/terms" element={<TermsPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="departments" element={<AdminDepartmentSetup />} />
        <Route path="analytics" element={<AdminUsageAnalytics />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentHome />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="departments" element={<StudentDepartmentsPage />} />
        <Route path="classrooms/:id" element={<StudentClassroomView />} />
        <Route path="library" element={<StudentLibraryPage />} />
        <Route path="lab" element={<StudentLabPage />} />
        <Route path="history" element={<StudentHistoryPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}