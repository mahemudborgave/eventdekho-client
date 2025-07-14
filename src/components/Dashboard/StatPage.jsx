import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import { ScaleLoader } from 'react-spinners';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const icons = [
  // Chart Bar
  <svg key="chart" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-yellow-500 dark:text-yellow-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V9m4 8V5m4 12v-6" /></svg>,
  // Users
  <svg key="users" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-teal-500 dark:text-teal-400"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 20H4v-2a4 4 0 014-4h1" /><circle cx="9" cy="7" r="4" /><circle cx="17" cy="7" r="4" /></svg>,
  // Calendar
  <svg key="calendar" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-500 dark:text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 4h8" /><rect width="18" height="18" x="3" y="5" rx="2" /></svg>,
];
const cardBgColors = [
  "bg-green-200 dark:bg-green-900",
  "bg-teal-200 dark:bg-teal-900",
  "bg-purple-200 dark:bg-purple-900"
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
  const [pendingQueries, setPendingQueries] = useState(0);
  const [totals, setTotals] = useState({ events: 0, registrations: 0, upcoming: 0 });

  const { user, email, token } = useContext(UserContext);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  const generateTimeSeries = (label, totalsArg, points) =>
    Array.from({ length: points }, (_, i) => {
      const factor = i / (points - 1);
      return {
        label: `${label} ${i + 1}`,
        Hosted: Math.round(factor * totalsArg.events),
        Registrations: Math.round(factor * totalsArg.registrations),
        Upcoming: Math.round(factor * totalsArg.upcoming),
      };
    });

  const updateChart = (range, totalsArg = totals) => {
    let points = 7;
    let label = "Day";
    if (range === "month") {
      points = 30;
      label = "Day";
    } else if (range === "year") {
      points = 12;
      label = "Month";
    }
    const data = generateTimeSeries(label, totalsArg, points);
    setChartData(data);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchStats = async () => {
      const StoredToken = localStorage.getItem("token");
      let response;

      if (StoredToken) {
        try {
          response = await axios.post(`${baseURL}:${port}/auth/verify`, {}, {
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

        setTotals({
          events: res.data.totalEvents,
          registrations: res.data.totalRegistrations,
          upcoming: res.data.upcomingEvents,
        });

        setStats([
          { label: "Events Hosted", value: res.data.totalEvents, change: "+14%" },
          { label: "Total Registrations", value: res.data.totalRegistrations, change: "+21%" },
          { label: "Upcoming Events", value: res.data.upcomingEvents, change: "+8%" },
        ]);

        setTopEvents(res.data.topEvents || []);
        setAvgRegistrations(res.data.avgRegistrations || 0);
        setRecentEvents(res.data.recentEvents || []);
        setEventTypeDistribution(res.data.eventTypeDistribution || []);
        setPreviousStats(res.data.previousStats || null);
        updateChart(timeRange, {
          events: res.data.totalEvents,
          registrations: res.data.totalRegistrations,
          upcoming: res.data.upcomingEvents,
        });
        // Fetch unresolved queries
        const qres = await axios.get(`${baseURL}:${port}/query`);
        const unresolved = Array.isArray(qres.data) ? qres.data.filter(q => !q.resolution || q.resolution.trim() === '').length : 0;
        setPendingQueries(unresolved);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchStats();
  }, [email]);

  useEffect(() => {
    updateChart(timeRange, totals);
  }, [timeRange, totals]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 min-h-[60vh]">
        <ScaleLoader />
      </div>
    );
  }

  if (!token) {
    return (
      <Link to='/login' className="block p-8 text-center text-red-700 underline dark:text-red-400">
        Log in to continue
      </Link>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 lg:p-8 p-4">
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
      <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100 text-center">Welcome back, {user}!</h1>
      <p className="mb-6 text-gray-500 dark:text-gray-300 text-center">Here's your event dashboard overview.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.slice(0, 3).map((stat, i) => (
          <Card key={stat.label} className={`flex items-center gap-4 ${cardBgColors[i]} border-none shadow-md`}>
            <CardContent className="flex items-center gap-4 p-4">
            {icons[i]}
            <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</div>
                <div className="text-md text-gray-600 dark:text-gray-300">{stat.label}</div>
                <div className="text-sm text-green-600 dark:text-green-400">{stat.change}</div>
            </div>
            </CardContent>
          </Card>
        ))}
        {/* Pending Queries Card */}
        <Card className="flex items-center gap-4 bg-red-200 dark:bg-red-900 border-none shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <MessageCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{pendingQueries}</div>
              <div className="text-md text-gray-600 dark:text-gray-300">Pending Queries</div>
              <div className="text-sm text-red-600 dark:text-red-400">Unresolved</div>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center mb-4">
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Growth Chart</CardTitle>
            <div className="ml-auto w-40">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="year">Past Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center w-full min-w-0 h-full">
            <div className="w-full min-w-0 h-full min-h-[16rem] sm:min-h-[300px] overflow-x-auto">
              {chartData.length > 0 ? (
                <Line
                  data={{
                    labels: chartData.map(d => d.label),
                    datasets: [
                      {
                        label: 'Hosted',
                        data: chartData.map(d => d.Hosted),
                        borderColor: '#FFD600',
                        backgroundColor: 'rgba(255, 214, 0, 0.2)',
                        tension: 0.4,
                        fill: true,
                      },
                      {
                        label: 'Registrations',
                        data: chartData.map(d => d.Registrations),
                        borderColor: '#4FD1C5',
                        backgroundColor: 'rgba(79, 209, 197, 0.2)',
                        tension: 0.4,
                        fill: true,
                      },
                      {
                        label: 'Upcoming',
                        data: chartData.map(d => d.Upcoming),
                        borderColor: '#F56565',
                        backgroundColor: 'rgba(245, 101, 101, 0.2)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: '#374151', // gray-700
                          font: { size: 14, weight: 'bold' },
                          padding: 20,
                        },
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: '#6B7280', // gray-500
                        },
                        grid: {
                          color: 'rgba(107, 114, 128, 0.1)',
                        },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: '#6B7280',
                        },
                        grid: {
                          color: 'rgba(107, 114, 128, 0.1)',
                        },
                      },
                    },
                  }}
                  style={{ height: '100%' }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ScaleLoader />
          </div>
              )}
        </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center mb-4 justify-between">
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Registrations Received for Events</CardTitle>
            <Button variant="link" className="text-blue-600 dark:text-blue-400 underline text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 p-0 h-auto" onClick={() => navigate('/admin/showeventsadmin')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
          {topEvents.length === 0 ? (
              <div className="text-gray-400 dark:text-gray-500">No data</div>
          ) : (
            <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Event Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Registrations</th>
                  </tr>
                </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {topEvents.slice(0, 5).map((event, idx) => (
                      <tr key={event.eventName} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900' : 'hover:bg-yellow-50 dark:hover:bg-yellow-900'}>
                        <td className="px-4 py-2 font-bold text-gray-700 dark:text-gray-100">{idx + 1}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-100">{event.eventName}</td>
                        <td className="px-4 py-2 text-teal-600 dark:text-teal-400 font-semibold text-center">{event.registrations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-indigo-100 to-indigo-400 dark:from-indigo-900 dark:to-indigo-700 border-none">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Average Registrations per Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{avgRegistrations}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ">
        <Card className="bg-gradient-to-r from-green-100 to-green-400 dark:from-green-900 dark:to-green-700 border-none">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Recent Events Created</CardTitle>
          </CardHeader>
          <CardContent>
          <ul>
              {recentEvents.length === 0 && <li className="text-gray-400 dark:text-gray-500">No data</li>}
            {recentEvents.map((event) => (
              <li key={event._id || event.eventName} className="flex justify-between py-1">
                  <span className="text-gray-800 dark:text-gray-100">{event.eventName}</span>
                  <span className="text-gray-500 dark:text-gray-300">{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''}</span>
              </li>
            ))}
          </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default StatPage;
