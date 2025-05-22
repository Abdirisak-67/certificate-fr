import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import StatsChart from '../../components/admin/StatsChart';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSpinner, FaUsers, FaGraduationCap, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSeminars: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
      return;
    }
    async function fetchStats() {
      setLoading(true);
      try {
        const [studentsRes, templatesRes] = await Promise.all([
          axios.get('https://certificat-backend.onrender.com/api/students', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('https://certificat-backend.onrender.com/api/templates', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setStats({
          totalStudents: studentsRes.data.length,
          totalSeminars: templatesRes.data.length
        });
      } catch (err) {
        toast.error('Failed to fetch statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="space-y-6">
            <StatsChart 
              totalStudents={stats.totalStudents} 
              totalTemplates={stats.totalSeminars} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <FaUsers className="text-blue-600 mr-3" size={24} />
                      <span className="text-blue-700 font-medium">Total Students</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                    <div className="flex items-center">
                      <FaGraduationCap className="text-pink-600 mr-3" size={24} />
                      <span className="text-pink-700 font-medium">Total Seminars</span>
                    </div>
                    <span className="text-2xl font-bold text-pink-600">{stats.totalSeminars}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">System Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-600 mr-3" size={24} />
                      <span className="text-green-700 font-medium">System Status</span>
                    </div>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <FaClock className="text-purple-600 mr-3" size={24} />
                      <span className="text-purple-700 font-medium">Last Updated</span>
                    </div>
                    <span className="text-purple-600 font-medium">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
