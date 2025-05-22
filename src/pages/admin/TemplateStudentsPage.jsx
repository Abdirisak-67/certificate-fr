import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';

export default function TemplateStudentsPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', number: '' });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [templateRes, studentsRes] = await Promise.all([
          axios.get(`https://certificat-backend.onrender.com/api/templates/${templateId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`https://certificat-backend.onrender.com/api/students?templateId=${templateId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        setTemplate(templateRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        toast.error('Failed to fetch data');
        setTemplate(null);
        setStudents([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [templateId]);

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    setDeletingId(studentId);
    try {
      await axios.delete(`/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Student deleted successfully');
      setStudents(students.filter(s => s._id !== studentId));
    } catch (err) {
      toast.error('Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditForm({ name: student.name, number: student.number });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://certificat-backend.onrender.com/api/students/${editingStudent._id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Student updated successfully');
      setStudents(students.map(s => 
        s._id === editingStudent._id ? { ...s, ...editForm } : s
      ));
      setEditingStudent(null);
    } catch (err) {
      toast.error('Failed to update student');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/admin/templates')}
              className="text-blue-600 hover:text-blue-800 mr-4 flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Templates
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {template?.name || 'Template'} Students
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-blue-600" size={60} />
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No students found for this template.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Number
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MdPerson className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deletingId === student._id}
                          >
                            {deletingId === student._id ? (
                              <FaSpinner className="animate-spin" size={18} />
                            ) : (
                              <FaTrash size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Edit Student</h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                    <input
                      type="text"
                      value={editForm.number}
                      onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
