import React, { useEffect, useState } from 'react';
import axios from 'axios';

function NumbersComp() {
  const [stats, setStats] = useState({
    visitors: null,
    events: null,
    colleges: null,
    students: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseURL = import.meta.env.VITE_BASE_URL;
        const port = import.meta.env.VITE_PORT;
        // Fetch public stats
        const statsRes = await axios.get(`${baseURL}:${port}/stats`);
        const { totalStudents, totalOrganizations, totalEvents } = statsRes.data;
        // Visitors (fetch count from GET /stats/visitors/total)
        let visitors = null;
        try {
          const visitorsRes = await axios.get(`${baseURL}:${port}/stats/visitors/total`);
          visitors = typeof visitorsRes.data.count === 'number' ? visitorsRes.data.count : null;
        } catch {
          visitors = null;
        }
        setStats({
          visitors,
          events: typeof totalEvents === 'number' ? totalEvents : null,
          colleges: typeof totalOrganizations === 'number' ? totalOrganizations : null,
          students: typeof totalStudents === 'number' ? totalStudents : null,
        });
      } catch (err) {
        setStats({ visitors: null, events: null, colleges: null, students: null });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="lg:px-40 px-4">
      <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-center text-[#0d0c22]">
        Platform Statistics
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">
          <p className="text-3xl lg:text-4xl font-bold text-amber-500">{loading ? '...' : (typeof stats.visitors === 'number' ? stats.visitors.toLocaleString() : 'N/A')}</p>
          <p className="mt-2 text-lg text-gray-600">Visitors</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">
          <p className="text-3xl lg:text-4xl font-bold text-amber-500">{loading ? '...' : (typeof stats.events === 'number' ? stats.events.toLocaleString() : 'N/A')}</p>
          <p className="mt-2 text-lg text-gray-600">Events</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">
          <p className="text-3xl lg:text-4xl font-bold text-amber-500">{loading ? '...' : (typeof stats.colleges === 'number' ? stats.colleges.toLocaleString() : 'N/A')}</p>
          <p className="mt-2 text-lg text-gray-600">Colleges</p>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl flex flex-col items-center">
          <p className="text-3xl lg:text-4xl font-bold text-amber-500">{loading ? '...' : (typeof stats.students === 'number' ? stats.students.toLocaleString() : 'N/A')}</p>
          <p className="mt-2 text-lg text-gray-600">Students</p>
        </div>
      </div>
    </div>
  );
}

export default NumbersComp;
