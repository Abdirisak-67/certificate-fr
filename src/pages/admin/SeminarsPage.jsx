import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSpinner, FaPlus } from 'react-icons/fa';

export default function SeminarsPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const res = await axios.get('https://certificat-backend.onrender.com/api/templates', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTemplates(res.data || []);
      } catch (err) {
        toast.error('Failed to fetch seminars');
        setTemplates([]);
      }
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this seminar?')) return;
    
    setDeletingId(id);
    try {
      await axios.delete(`https://certificat-backend.onrender.com/api/templates/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Seminar deleted successfully');
      setTemplates(templates.filter(t => t._id !== id));
    } catch (err) {
      toast.error('Failed to delete seminar');
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Seminars</h1>
            <button
              onClick={() => navigate('/admin/templates/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" size={16} />
              New Seminar
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-blue-600" size={40} />
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No seminars found. Create your first seminar!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template._id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={() => navigate(`/admin/templates/${template._id}/students`)}>
                  <div className="p-6 flex items-center">
                    <h3 className="text-xl font-semibold mb-0">{template.name}</h3>
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
