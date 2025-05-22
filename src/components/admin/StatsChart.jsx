import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function StatsChart({ totalStudents, totalTemplates }) {
  const data = {
    labels: ['Students', 'Seminars'],
    datasets: [
      {
        data: [totalStudents, totalTemplates],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
            <p className="text-4xl font-bold text-blue-600">{totalStudents}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700">Total Seminars</h3>
            <p className="text-4xl font-bold text-pink-600">{totalTemplates}</p>
          </div>
        </div>
        <div className="h-64">
          <Doughnut data={data} options={options} />
        </div>
      </div>
    </div>
  );
} 