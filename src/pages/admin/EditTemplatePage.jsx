import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import TemplateEditor from '../../components/admin/TemplateEditor';

export default function EditTemplatePage() {
  const navigate = useNavigate();
  const { templateId } = useParams();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleSave = () => {
    navigate('/admin/templates');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/admin/templates')}
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              ← Back
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Edit Certificate Template</h1>
          </div>
          {/* Workspace: advanced certificate template editor */}
          <TemplateEditor templateId={templateId} onSave={handleSave} />
        </div>
      </main>
    </div>
  );
}