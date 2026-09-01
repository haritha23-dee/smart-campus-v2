// frontend/src/App.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/appRoutes';

export default function App() {
  const location = useLocation();
  const hidePublicShell =
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/student') ||
    location.pathname.startsWith('/faculty') ||
    location.pathname.startsWith('/library-staff') ||
    location.pathname.startsWith('/lab-staff');

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors duration-200">
      {!hidePublicShell && <Navbar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!hidePublicShell && <Footer />}
    </div>
  );
}