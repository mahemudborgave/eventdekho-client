import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserCheck, 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  ShieldOff,
  UserX,
  UserCheck as UserCheckIcon
} from 'lucide-react';

function RootUsersEnhanced() {
  const [users, setUsers] = useState({ students: [], organizations: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    checkAuthAndFetchUsers();
  }, []);

  const checkAuthAndFetchUsers = async () => {
    const rootToken = localStorage.getItem('rootToken');
    
    if (!rootToken) {
      toast.error('Access denied. Please login as root.');
      navigate('/root/login');
      return;
    }

    try {
      await axios.post(`${baseURL}:${port}/root/verify`, {}, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      const response = await axios.get(`${baseURL}:${port}/root/users`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      setUsers(response.data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('rootToken');
        localStorage.removeItem('rootUser');
        toast.error('Session expired. Please login again.');
        navigate('/root/login');
      } else {
        toast.error('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.delete(`${baseURL}:${port}/root/users/${userId}`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      toast.success('User deleted successfully');
      checkAuthAndFetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleVerification = async (userId, currentStatus) => {
    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.patch(`${baseURL}:${port}/root/users/${userId}/verify`, 
        { isVerified: !currentStatus },
        { headers: { Authorization: `Bearer ${rootToken}` } }
      );
      toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      checkAuthAndFetchUsers();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.patch(`${baseURL}:${port}/root/users/${userId}/status`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${rootToken}` } }
      );
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      checkAuthAndFetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const filteredStudents = users.students?.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentCollegeName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredOrganizations = users.organizations?.filter(org =>
    org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.city?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const currentData = activeTab === 'students' ? filteredStudents : filteredOrganizations;

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
              <button
                onClick={() => navigate('/root/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Manage students and organizations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-green-600">{users.totalStudents || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                <p className="text-2xl font-bold text-purple-600">{users.totalOrganizations || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(users.students?.filter(s => s.isVerified).length || 0) + 
                   (users.organizations?.filter(o => o.isVerified).length || 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(users.students?.filter(s => s.isActive !== false).length || 0) + 
                   (users.organizations?.filter(o => o.isActive !== false).length || 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <UserCheckIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students ({users.totalStudents || 0})
              </button>
              <button
                onClick={() => setActiveTab('organizations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'organizations'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Organizations ({users.totalOrganizations || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Users Grid with Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.map((user) => (
            <div key={user._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {activeTab === 'students' ? user.name : user.organizationName}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex space-x-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isVerified ? '✓' : '✗'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive !== false 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isActive !== false ? '●' : '○'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {activeTab === 'students' ? (
                    <>
                      {user.studentCollegeName && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">College:</span> {user.studentCollegeName}
                        </div>
                      )}
                      {user.course && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Course:</span> {user.course}
                        </div>
                      )}
                      {user.branch && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Branch:</span> {user.branch}
                        </div>
                      )}
                      {user.mobno && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Mobile:</span> {user.mobno}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {user.city && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">City:</span> {user.city}
                        </div>
                      )}
                      {user.organizationType && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {user.organizationType}
                        </div>
                      )}
                      {user.phone && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span> {user.phone}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleVerification(user._id, user.isVerified)}
                      className={`p-2 rounded-full ${
                        user.isVerified 
                          ? 'text-red-600 hover:bg-red-100' 
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                      title={user.isVerified ? 'Unverify User' : 'Verify User'}
                    >
                      {user.isVerified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive !== false)}
                      className={`p-2 rounded-full ${
                        user.isActive !== false 
                          ? 'text-orange-600 hover:bg-orange-100' 
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                      title={user.isActive !== false ? 'Deactivate User' : 'Activate User'}
                    >
                      {user.isActive !== false ? <UserX className="h-4 w-4" /> : <UserCheckIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentData.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No {activeTab} found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RootUsersEnhanced; 