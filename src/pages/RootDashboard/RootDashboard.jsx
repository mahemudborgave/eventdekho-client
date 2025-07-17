import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  LogOut, 
  Eye, 
  UserCheck, 
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';
import FeaturedImagesManager from '../../components/Dashboard/FeaturedImagesManager';
import { Tabs, Tab } from '@mui/material';

function RootDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  // Transaction history state
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const adminEmail = localStorage.getItem('rootUser') || '';

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    checkAuthAndFetchStats();
  }, []);

  useEffect(() => {
    if (tabIndex === 1) {
      const fetchTransactions = async () => {
        setLoadingTx(true);
        try {
          const res = await axios.get(`${baseURL}:${port}/api/payment/organizer-transactions`, {
            params: { organizerEmail: adminEmail },
            headers: { Authorization: `Bearer ${localStorage.getItem('rootToken')}` }
          });
          setTransactions(res.data);
        } catch (err) {
          console.error('Failed to fetch transactions:', err);
        } finally {
          setLoadingTx(false);
        }
      };
      fetchTransactions();
    }
  }, [tabIndex, baseURL, port, adminEmail]);

  const checkAuthAndFetchStats = async () => {
    const rootToken = localStorage.getItem('rootToken');
    
    if (!rootToken) {
      toast.error('Access denied. Please login as root.');
      navigate('/root/login');
      return;
    }

    try {
      // Verify token
      await axios.post(`${baseURL}:${port}/root/verify`, {}, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      // Fetch stats
      const response = await axios.get(`${baseURL}:${port}/root/stats`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('rootToken');
        localStorage.removeItem('rootUser');
        toast.error('Session expired. Please login again.');
        navigate('/root/login');
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rootToken');
    localStorage.removeItem('rootUser');
    toast.success('Logged out successfully');
    navigate('/root/login');
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:scale-105 ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const NavigationCard = ({ title, description, icon: Icon, color, path }) => (
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
      onClick={() => navigate(path)}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Settings className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Root Dashboard</h1>
                <p className="text-sm text-gray-600">System Administration</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} className="mb-8">
          <Tab label="Dashboard" />
          <Tab label="Transactions" />
        </Tabs>
        {tabIndex === 0 && (
          <>
        {/* Featured Images Manager */}
        <FeaturedImagesManager />
        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Events"
              value={stats?.totalEvents || 0}
              icon={Calendar}
              color="text-blue-600"
              onClick={() => navigate('/root/events')}
            />
            <StatCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              icon={Users}
              color="text-green-600"
              onClick={() => navigate('/root/users')}
            />
            <StatCard
              title="Total Organizations"
              value={stats?.totalOrganizations || 0}
              icon={UserCheck}
              color="text-purple-600"
              onClick={() => navigate('/root/users')}
            />
            <StatCard
              title="Total Registrations"
              value={stats?.totalRegistrations || 0}
              icon={FileText}
              color="text-orange-600"
              onClick={() => navigate('/root/registrations')}
            />
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NavigationCard
              title="All Events"
              description="View and manage all events in the system"
              icon={Calendar}
              color="text-blue-600"
              path="/root/events"
            />
            <NavigationCard
              title="All Users"
              description="View students and organizations"
              icon={Users}
              color="text-green-600"
              path="/root/users"
            />
            <NavigationCard
              title="All Registrations"
              description="View all event registrations"
              icon={FileText}
              color="text-orange-600"
              path="/root/registrations"
            />
            <NavigationCard
              title="Analytics"
              description="View detailed analytics and reports"
              icon={BarChart3}
              color="text-purple-600"
              path="/root/analytics"
            />
            <NavigationCard
              title="System Monitor"
              description="Monitor system activity and performance"
              icon={Activity}
              color="text-red-600"
              path="/root/monitor"
            />
            <NavigationCard
              title="Trends"
              description="View growth trends and patterns"
              icon={TrendingUp}
              color="text-indigo-600"
              path="/root/trends"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center text-gray-500 py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Activity monitoring coming soon...</p>
          </div>
        </div>
          </>
        )}
        {tabIndex === 1 && (
          <div className="w-full max-w-5xl mt-4">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Event Transaction History</h2>
            {loadingTx ? (
              <div className="text-blue-600">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-gray-500">No transactions found for your events.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table className="min-w-full bg-white text-sm">
                  <thead className="bg-gradient-to-r from-yellow-200 to-orange-100 text-yellow-900">
                    <tr>
                      <th className="px-4 py-2 text-left">Event ID</th>
                      <th className="px-4 py-2 text-left">Student Email</th>
                      <th className="px-4 py-2 text-left">Amount (₹)</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Transaction ID</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx._id} className="border-b last:border-0">
                        <td className="px-4 py-2">{tx.eventId}</td>
                        <td className="px-4 py-2">{tx.studentId}</td>
                        <td className="px-4 py-2">{(tx.amount || 'N/A')}</td>
                        <td className="px-4 py-2 font-semibold text-green-700">{tx.status}</td>
                        <td className="px-4 py-2">{tx.razorpay_payment_id || 'N/A'}</td>
                        <td className="px-4 py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RootDashboard; 