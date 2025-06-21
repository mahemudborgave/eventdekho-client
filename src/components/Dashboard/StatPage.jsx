import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import { ScaleLoader } from 'react-spinners';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function StatPage() {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [isShow, setIsShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const { email, token } = useContext(UserContext);
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
      <div className="flex justify-center items-center p-10">
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
    <main className="flex-1 min-h-screen lg:p-8 p-2">
      <div className="flex items-center mb-8">
        <h1 className="text-2xl lg:text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <div className="flex-1" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white lg:p-4 p-2 flex items-center gap-4 shadow border border-gray-100">
            <div className="text-2xl text-[#FFD600]">📊</div>
            <div>
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-xs text-green-500">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4 overflow-auto">
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

      <div className='overflow-scroll'>
        <div className="bg-white lg:p-6 p-4 rounded shadow mb-8 w-200">
          <ResponsiveContainer height={300}>
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

      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md shadow-sm">
        <p className="font-semibold mb-2">Instructions:</p>
        <p className="mb-1">• This section displays important guidelines for using the website.</p>
        <p className="mb-1">• Review all details carefully before performing any action.</p>
        <p className="mb-1">• Make sure data (like participant info) is valid and accurate.</p>
        <div className="mt-5 text-red-600">
          <p>1. Use the Participate button on event-detail page to test registrations.</p>
        </div>
      </div>
    </main>
  );
}

export default StatPage;
