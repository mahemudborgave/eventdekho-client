import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import { ScaleLoader } from 'react-spinners';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

// Heroicons SVGs for stat cards (with color for contrast)
const icons = [
  // Chart Bar
  <svg key="chart" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V9m4 8V5m4 12v-6" /></svg>,
  // Users
  <svg key="users" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-teal-500"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 20H4v-2a4 4 0 014-4h1" /><circle cx="9" cy="7" r="4" /><circle cx="17" cy="7" r="4" /></svg>,
  // Calendar
  <svg key="calendar" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 4h8" /><rect width="18" height="18" x="3" y="5" rx="2" /></svg>,
  // Academic Cap
  <svg key="college" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 19a7 7 0 0014 0" /></svg>
];
const cardBgColors = [
  "bg-green-200",
  "bg-teal-200",
  "bg-red-200",
  "bg-blue-200"
];

function StatPage() {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [isShow, setIsShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topEvents, setTopEvents] = useState([]);
  const [avgRegistrations, setAvgRegistrations] = useState(0);
  const [recentEvents, setRecentEvents] = useState([]);
  const [eventTypeDistribution, setEventTypeDistribution] = useState([]);
  const [previousStats, setPreviousStats] = useState(null);

  const { user, email, token } = useContext(UserContext);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  const total = { events: 0, registrations: 0, upcoming: 0 };

  const generateTimeSeries = (label, total, points) =>
    Array.from({ length: points }, (_, i) => {
      const factor = i / (points - 1);
      return {
        label: `${label} ${i + 1}`,
        Hosted: Math.round(factor * total.events),
        Registrations: Math.round(factor * total.registrations),
        Upcoming: Math.round(factor * total.upcoming),
      };
    });

  const updateChart = (range) => {
    let points = 7;
    let label = "Day";

    if (range === "month") {
      points = 30;
      label = "Day";
    } else if (range === "year") {
      points = 12;
      label = "Month";
    }

    const data = generateTimeSeries(label, total, points);
    setChartData(data);
  };

  useEffect(() => {
    const checkAuthAndFetchStats = async () => {
      const StoredToken = localStorage.getItem("token");
      let response;

      if (StoredToken) {
        try {
          response = await axios.post(`${baseURL}:${port}/userauth/verifytoken`, {}, {
            headers: { Authorization: `Bearer ${StoredToken}` }
          });
        } catch (e) {
          console.error("Error verifying token", e);
        }
      }

      if (StoredToken && response) {
        setIsShow(true);
        fetchStats();
      } else {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await axios.post(`${baseURL}:${port}/eventt/stats`, { email });

        total.events = res.data.totalEvents;
        total.registrations = res.data.totalRegistrations;
        total.upcoming = res.data.upcomingEvents;

        setStats([
          { label: "Events Hosted", value: total.events, change: "+14%" },
          { label: "Total Registrations", value: total.registrations, change: "+21%" },
          { label: "Upcoming Events", value: total.upcoming, change: "+8%" },
          { label: "Total Colleges", value: res.data.totalColleges, change: "+2%" },
        ]);

        setTopEvents(res.data.topEvents || []);
        setAvgRegistrations(res.data.avgRegistrations || 0);
        setRecentEvents(res.data.recentEvents || []);
        setEventTypeDistribution(res.data.eventTypeDistribution || []);
        setPreviousStats(res.data.previousStats || null);

        updateChart(timeRange);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchStats();
  }, [email]);

  useEffect(() => {
    updateChart(timeRange);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 min-h-[60vh]">
        <ScaleLoader />
      </div>
    );
  }

  if (!token) {
    return (
      <Link to='/login' className="block p-8 text-center text-red-700 underline">
        Log in to continue
      </Link>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-gray-50 lg:p-8 p-4">
      {/* Animated SVG Illustration */}
      <div className="flex justify-center mb-4">
        <svg className="w-32 h-32 animate-bounce" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="16" y="80" width="16" height="32" rx="4" fill="#4FD1C5" className="animate-pulse"/>
          <rect x="40" y="56" width="16" height="56" rx="4" fill="#FFD600" className="animate-pulse delay-100"/>
          <rect x="64" y="32" width="16" height="80" rx="4" fill="#F56565" className="animate-pulse delay-200"/>
          <rect x="88" y="16" width="16" height="96" rx="4" fill="#6366F1" className="animate-pulse delay-300"/>
          <circle cx="104" cy="16" r="8" fill="#6366F1" className="animate-pulse delay-300"/>
          <circle cx="80" cy="32" r="8" fill="#F56565" className="animate-pulse delay-200"/>
          <circle cx="56" cy="56" r="8" fill="#FFD600" className="animate-pulse delay-100"/>
          <circle cx="32" cy="80" r="8" fill="#4FD1C5" className="animate-pulse"/>
        </svg>
      </div>
      {/* Greeting */}
      <h1 className="text-2xl font-bold mb-2 text-gray-800 text-center">Welcome back, {user}!</h1>
      <p className="mb-6 text-gray-500 text-center">Here's your event dashboard overview.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={stat.label} className={`p-4 flex items-center gap-4 rounded-lg border border-gray-100 hover:shadow-lg transition ${cardBgColors[i]}`}>
            {icons[i]}
            <div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-md text-gray-600">{stat.label}</div>
              <div className="text-sm text-green-600">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-400 lg:p-8 p-4">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Growth Chart</h2>
            <select
              className="ml-auto border px-3 py-1 rounded"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>
          <div className="flex justify-center items-center w-full">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Hosted" stroke="#FFD600" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Registrations" stroke="#4FD1C5" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Upcoming" stroke="#F56565" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-400 lg:p-8 p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-5">Registrations Received for Events</h2>
          {topEvents.length === 0 ? (
            <div className="text-gray-400">No data</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registrations</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {topEvents.slice(0, 5).map((event, idx) => (
                    <tr key={event.eventName} className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-yellow-50' : 'hover:bg-yellow-50'}>
                      <td className="px-4 py-2 font-bold text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-2 text-gray-700">{event.eventName}</td>
                      <td className="px-4 py-2 text-teal-600 font-semibold text-center">{event.registrations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* <div className="bg-white shadow rounded-lg border border-gray-100 p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Top 3 Events by Registrations</h2>
          <ul>
            {topEvents.length === 0 && <li className="text-gray-400">No data</li>}
            {topEvents.map((event, idx) => (
              <li key={event.eventName} className="flex justify-between py-1">
                <span>{idx + 1}. {event.eventName}</span>
                <span className="font-bold">{event.registrations}</span>
              </li>
            ))}
          </ul>
        </div> */}
        <div className="bg-white rounded-lg border border-gray-100 p-4 bg-gradient-to-r from-indigo-100 to-indigo-400">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Average Registrations per Event</h2>
          <div className="text-2xl font-bold">{avgRegistrations}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ">
        <div className="bg-white rounded-lg border border-gray-100 p-4 bg-gradient-to-r from-green-100 to-green-400">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Recent Events Created</h2>
          <ul>
            {recentEvents.length === 0 && <li className="text-gray-400">No data</li>}
            {recentEvents.map((event) => (
              <li key={event._id || event.eventName} className="flex justify-between py-1">
                <span>{event.eventName}</span>
                <span className="text-gray-500">{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

export default StatPage;
