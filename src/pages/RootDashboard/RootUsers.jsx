import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  FileText,
  FileSpreadsheet,
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function RootUsers() {
  const [users, setUsers] = useState({ students: [], organizations: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
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
      // Verify token
      await axios.post(`${baseURL}:${port}/root/verify`, {}, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      // Fetch users
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, ' ');
  };

  const handleViewUser = async (userId) => {
    const rootToken = localStorage.getItem('rootToken');
    try {
      const response = await axios.get(`${baseURL}:${port}/root/users/${userId}`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      setSelectedUser(response.data);
      setShowUserModal(true);
    } catch (error) {
      toast.error('Failed to fetch user details');
    }
  };

  const handleEditUser = (user) => {
    setEditForm(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.put(`${baseURL}:${port}/root/users/${editForm._id}`, editForm, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      toast.success('User updated successfully');
      setShowEditModal(false);
      checkAuthAndFetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update user');
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
      checkAuthAndFetchUsers(); // Refresh the list
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
      checkAuthAndFetchUsers(); // Refresh the list
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
      checkAuthAndFetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    doc.text(`All ${activeTab === 'students' ? 'Students' : 'Organizations'} - Root Dashboard`, 14, 16);
    
    const data = activeTab === 'students' ? users.students : users.organizations;
    
    if (activeTab === 'students') {
      const tableColumn = [
        "#", "Student ID", "Name", "Email", "Gender", "College", "Course", "Branch", "Year", "Mobile", "Verified", "Active", "Created At"
      ];
      const tableRows = data.map((student, index) => [
        index + 1,
        student._id || '',
        student.name || '',
        student.email || '',
        student.gender || '',
        student.studentCollegeName || '',
        student.course || '',
        student.branch || '',
        student.year || '',
        student.mobno || '',
        student.isVerified ? 'Yes' : 'No',
        student.isActive !== false ? 'Yes' : 'No',
        formatDate(student.createdAt)
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto'
      });
    } else {
      const tableColumn = [
        "#", "Org ID", "Name", "Short Name", "Type", "Email", "Phone", "City", "Website", "Contact Person", "Verified", "Active", "Created At"
      ];
      const tableRows = data.map((org, index) => [
        index + 1,
        org._id || '',
        org.organizationName || '',
        org.shortName || '',
        org.organizationType || '',
        org.email || '',
        org.phone || '',
        org.city || '',
        org.website || '',
        org.contactPerson || '',
        org.isVerified ? 'Yes' : 'No',
        org.isActive !== false ? 'Yes' : 'No',
        formatDate(org.createdAt)
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto'
      });
    }

    doc.save(`${activeTab}_root_dashboard.pdf`);
  };

  const exportToExcel = () => {
    const data = activeTab === 'students' ? users.students : users.organizations;
    
    let worksheetData;
    if (activeTab === 'students') {
      worksheetData = data.map((student, index) => ({
        "#": index + 1,
        "Student ID": student._id || '',
        "Name": student.name || '',
        "Email": student.email || '',
        "Gender": student.gender || '',
        "College": student.studentCollegeName || '',
        "Course": student.course || '',
        "Branch": student.branch || '',
        "Year": student.year || '',
        "Mobile": student.mobno || '',
        "Verified": student.isVerified ? 'Yes' : 'No',
        "Active": student.isActive !== false ? 'Yes' : 'No',
        "Created At": formatDate(student.createdAt)
      }));
    } else {
      worksheetData = data.map((org, index) => ({
        "#": index + 1,
        "Org ID": org._id || '',
        "Name": org.organizationName || '',
        "Short Name": org.shortName || '',
        "Type": org.organizationType || '',
        "Email": org.email || '',
        "Phone": org.phone || '',
        "City": org.city || '',
        "Website": org.website || '',
        "Contact Person": org.contactPerson || '',
        "Verified": org.isVerified ? 'Yes' : 'No',
        "Active": org.isActive !== false ? 'Yes' : 'No',
        "Created At": formatDate(org.createdAt)
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'students' ? 'Students' : 'Organizations');
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${activeTab}_root_dashboard.xlsx`);
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
            <div className="flex space-x-3">
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export Excel</span>
              </button>
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

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {activeTab === 'students' ? user.name?.charAt(0) : user.organizationName?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {activeTab === 'students' ? user.name : user.organizationName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activeTab === 'students' ? user.mobno : user.phone}
                      </div>
                      {activeTab === 'organizations' && user.website && (
                        <div className="text-sm text-gray-500">{user.website}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activeTab === 'students' ? (
                          <>
                            {user.studentCollegeName && <div>{user.studentCollegeName}</div>}
                            {user.course && user.branch && <div>{user.course} - {user.branch}</div>}
                            {user.year && <div>{user.year}</div>}
                          </>
                        ) : (
                          <>
                            {user.city && <div>{user.city}</div>}
                            {user.organizationType && <div>{user.organizationType}</div>}
                            {user.contactPerson && <div>{user.contactPerson}</div>}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive !== false 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleVerification(user._id, user.isVerified)}
                          className={`p-1 ${user.isVerified ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={user.isVerified ? 'Unverify User' : 'Verify User'}
                        >
                          {user.isVerified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive !== false)}
                          className={`p-1 ${user.isActive !== false ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                          title={user.isActive !== false ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive !== false ? <UserX className="h-4 w-4" /> : <UserCheckIcon className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {currentData.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No {activeTab} found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name:</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.userType === 'student' ? selectedUser.user.name : selectedUser.user.organizationName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email:</label>
                  <p className="text-sm text-gray-900">{selectedUser.user.email}</p>
                </div>
                {selectedUser.userType === 'student' ? (
                  <>
                    {selectedUser.user.gender && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Gender:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.gender}</p>
                      </div>
                    )}
                    {selectedUser.user.studentCollegeName && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">College:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.studentCollegeName}</p>
                      </div>
                    )}
                    {selectedUser.user.course && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Course:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.course}</p>
                      </div>
                    )}
                    {selectedUser.user.branch && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Branch:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.branch}</p>
                      </div>
                    )}
                    {selectedUser.user.year && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Year:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.year}</p>
                      </div>
                    )}
                    {selectedUser.user.mobno && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Mobile:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.mobno}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {selectedUser.user.shortName && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Short Name:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.shortName}</p>
                      </div>
                    )}
                    {selectedUser.user.organizationType && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.organizationType}</p>
                      </div>
                    )}
                    {selectedUser.user.city && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">City:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.city}</p>
                      </div>
                    )}
                    {selectedUser.user.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.phone}</p>
                      </div>
                    )}
                    {selectedUser.user.website && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Website:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.website}</p>
                      </div>
                    )}
                    {selectedUser.user.contactPerson && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Contact Person:</label>
                        <p className="text-sm text-gray-900">{selectedUser.user.contactPerson}</p>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Created:</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedUser.user.createdAt)}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.user.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.user.isActive !== false 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editForm.name || editForm.organizationName || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      [activeTab === 'students' ? 'name' : 'organizationName']: e.target.value
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {activeTab === 'students' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile</label>
                      <input
                        type="text"
                        value={editForm.mobno || ''}
                        onChange={(e) => setEditForm({...editForm, mobno: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">College</label>
                      <input
                        type="text"
                        value={editForm.studentCollegeName || ''}
                        onChange={(e) => setEditForm({...editForm, studentCollegeName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        value={editForm.city || ''}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleUpdateUser}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RootUsers;