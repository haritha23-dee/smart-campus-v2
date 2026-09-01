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

import FacultyLayout from '../layouts/FacultyLayout';
import FacultyHome from '../pages/faculty/FacultyHome';
import FacultyProfile from '../pages/faculty/FacultyProfile';
import FacultyClassroomHub from '../pages/faculty/FacultyClassroomHub';
import FacultyClassroomDetail from '../pages/faculty/FacultyClassroomDetail';
import FacultyResourceHistory from '../pages/faculty/FacultyResourceHistory';

import LibraryStaffLayout from '../layouts/LibraryStaffLayout';
import LibraryStaffHome from '../pages/libraryStaff/LibraryStaffHome';
import LibraryStaffInventory from '../pages/libraryStaff/LibraryStaffInventory';
import LibraryStaffRequests from '../pages/libraryStaff/LibraryStaffRequests';
import LibraryStaffReturns from '../pages/libraryStaff/LibraryStaffReturns';
import LibraryStaffProfile from '../pages/libraryStaff/LibraryStaffProfile';
import LibraryStaffHistory from '../pages/libraryStaff/LibraryStaffHistory';

import LabStaffLayout from '../layouts/LabStaffLayout';
import LabStaffHome from '../pages/labStaff/LabStaffHome';
import LabStaffInventory from '../pages/labStaff/LabStaffInventory';
import LabStaffRequests from '../pages/labStaff/LabStaffRequests';
import LabStaffReturns from '../pages/labStaff/LabStaffReturns';
import LabStaffProfile from '../pages/labStaff/LabStaffProfile';
import LabStaffHistory from '../pages/labStaff/LabStaffHistory';
import { Rotate3D } from 'lucide-react';

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

        <Route
            path="/faculty"
            element={<ProtectedRoute allowedRoles={['faculty']}><FacultyLayout /></ProtectedRoute>}>
            <Route index element={<FacultyHome />} />
            <Route path="profile" element={<FacultyProfile />} />
            <Route path="classrooms" element={<FacultyClassroomHub />} />
            <Route path="classrooms/:id" element={<FacultyClassroomDetail />} />
            <Route path="history" element={<FacultyResourceHistory />} />
        </Route>

        <Route
            path="/library-staff"
            element={
                <ProtectedRoute allowedRoles={['library_staff']}>
                    <LibraryStaffLayout/>
                </ProtectedRoute>
            }
        >
            <Route index element={<LibraryStaffHome />} />
            <Route path="inventory" element={<LibraryStaffInventory />} />
            <Route path="requests" element={<LibraryStaffRequests />} />
            <Route path="returns" element={<LibraryStaffReturns />} />
            <Route path="profile" element={<LibraryStaffProfile />} />
            <Route path="history" element={<LibraryStaffHistory />} />
        </Route>

        <Route
          path="lab-staff"
          element={
            <ProtectedRoute allowedRoles={['lab_staff']}>
              <LibraryStaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<LabStaffHome />} />
          <Route path="inventory" element={<LabStaffInventory />} />
          <Route path="requests" element={<LabStaffRequests />} />
          <Route path="returns" element={<LabStaffReturns />} />
          <Route path="profile" element={<LabStaffProfile />} />
          <Route path="history" element={<LabStaffHistory />} />
        </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}