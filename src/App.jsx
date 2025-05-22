import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardPage from './pages/admin/DashboardPage';
import HomePage from './pages/client/HomePage';
import TemplatesPage from './pages/admin/TemplatesPage';
import UploadPage from './pages/admin/UploadPage';
import SeminarsPage from './pages/admin/SeminarsPage';
import LoginPage from './pages/admin/LoginPage';
import RegisterPage from './pages/admin/RegisterPage';
import CertificatePage from './pages/client/CertificatePage';
import TemplateStudentsPage from './pages/admin/TemplateStudentsPage';
import NewTemplatePage from './pages/admin/NewTemplatePage';
import EditTemplatePage from './pages/admin/EditTemplatePage';

export const App = () => {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/templates" element={<TemplatesPage />} />
        <Route path="/admin/templates/new" element={<NewTemplatePage />} />
        <Route path="/admin/templates/:templateId/edit" element={<EditTemplatePage />} />
        <Route path="/admin/upload" element={<UploadPage />} />
        <Route path="/admin/seminars" element={<SeminarsPage />} />
        <Route path="/admin/templates/:templateId/students" element={<TemplateStudentsPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/register" element={<RegisterPage />} />
        <Route path="/certificate/:number" element={<CertificatePage />} />
      </Routes>
    </Router>
  );
}

export default App;