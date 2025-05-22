import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdDelete, MdEdit, MdAdd, MdPeople } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://certificat-backend.onrender.com/api/templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTemplates(res.data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      toast.error('Failed to fetch templates');
      setTemplates([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    setDeletingId(id);
    try {
      await axios.delete(`https://certificat-backend.onrender.com/api/templates/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Templates</h1>
            <button
              onClick={() => navigate('/admin/templates/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <MdAdd className="mr-2" size={20} />
              New Template
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-blue-600" size={40} />
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No templates found. Create your first template!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => navigate(`/admin/templates/${template._id}/students`)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <MdPeople className="mr-1" size={20} />
                        Students
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/admin/templates/${template._id}/edit`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={deletingId === template._id}
                        >
                          {deletingId === template._id ? (
                            <FaSpinner className="animate-spin" size={20} />
                          ) : (
                            <MdDelete size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
