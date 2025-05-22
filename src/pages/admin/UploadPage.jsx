import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSpinner, FaUpload, FaExclamationTriangle } from 'react-icons/fa';

export default function UploadPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ name: '', number: '', template: '' });
  const [excelFile, setExcelFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [templateError, setTemplateError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch templates
    setIsLoading(true);
    setTemplateError('');
    axios.get('https://certificat-backend.onrender.com/api/templates', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => {
        if (res.data && res.data.length > 0) {
          setTemplates(res.data);
        } else {
          setTemplateError('No templates available. Please create a template first.');
        }
      })
      .catch(() => {
        toast.error('Failed to fetch templates');
        setTemplateError('Failed to load templates. Please try again later.');
        setTemplates([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.template) {
      toast.error('Please select a certificate template');
      return;
    }
    setIsUploading(true);
    try {
      await axios.post('https://certificat-backend.onrender.com/api/students/register', form, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      toast.success('Student registered successfully!');
      setForm({ name: '', number: '', template: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering student');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Excel file selection
  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  // Handle Excel file upload
  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!form.template) {
      toast.error('Please select a certificate template');
      return;
    }

    const formData = new FormData();
    formData.append('file', excelFile);
    // Use correct field name for template in FormData
    formData.append('template', form.template);

    setIsUploading(true);
    try {
      await axios.post('https://certificat-backend.onrender.com/api/students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Students uploaded successfully!');
      setExcelFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading students');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Register Student</h1>
        
        {/* Single Student Registration */}
        <div className="bg-white rounded-lg shadow p-6 max-w-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Register Single Student</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded text-sm"
                disabled={isLoading || isUploading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Number</label>
              <input 
                name="number" 
                value={form.number} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded text-sm"
                disabled={isLoading || isUploading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Certificate Template</label>
              {isLoading ? (
                <div className="flex items-center justify-center p-2 border rounded bg-gray-50">
                  <FaSpinner className="animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Loading templates...</span>
                </div>
              ) : templateError ? (
                <div className="flex items-center p-2 border rounded bg-red-50 text-red-600">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="text-sm">{templateError}</span>
                </div>
              ) : (
                <select 
                  name="template" 
                  value={form.template} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-2 border rounded text-sm"
                  disabled={isLoading || isUploading}
                >
                  <option value="">Select template</option>
                  {templates.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"
              disabled={isLoading || isUploading || !!templateError}
            >
              {isUploading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                'Register Student'
              )}
            </button>
          </form>
        </div>

        {/* Bulk Upload */}
        <div className="bg-white rounded-lg shadow p-6 max-w-lg">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload Students</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Certificate Template</label>
              {isLoading ? (
                <div className="flex items-center justify-center p-2 border rounded bg-gray-50">
                  <FaSpinner className="animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Loading templates...</span>
                </div>
              ) : templateError ? (
                <div className="flex items-center p-2 border rounded bg-red-50 text-red-600">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="text-sm">{templateError}</span>
                </div>
              ) : (
                <select 
                  name="template" 
                  value={form.template} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-2 border rounded text-sm mb-4"
                  disabled={isLoading || isUploading}
                >
                  <option value="">Select template</option>
                  {templates.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Excel File</label>
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleExcelChange}
                className="w-full p-2 border rounded text-sm"
                disabled={isLoading || isUploading || !!templateError}
              />
            </div>
            <button 
              onClick={handleExcelUpload}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex items-center justify-center"
              disabled={isLoading || isUploading || !excelFile || !form.template || !!templateError}
            >
              {isUploading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Upload Excel File
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
