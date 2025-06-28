import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function RootRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    checkAuthAndFetchRegistrations();
  }, []);

  const checkAuthAndFetchRegistrations = async () => {
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

      // Fetch registrations
      const response = await axios.get(`${baseURL}:${port}/root/registrations`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      setRegistrations(response.data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('rootToken');
        localStorage.removeItem('rootUser');
        toast.error('Session expired. Please login again.');
        navigate('/root/login');
      } else {
        toast.error('Failed to fetch registrations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
      return;
    }

    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.delete(`${baseURL}:${port}/root/registrations/${registrationId}`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      toast.success('Registration deleted successfully');
      checkAuthAndFetchRegistrations(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete registration');
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

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    doc.text("All Registrations - Root Dashboard", 14, 16);
    
    const tableColumn = [
      "#", "Registration ID", "Event Name", "Student Name", "Email", "Gender", "College", "Branch", "Course", "Year", "Mobile", "Organization", "Created At"
    ];
    const tableRows = registrations.map((reg, index) => [
      index + 1,
      reg._id || '',
      reg.eventName || '',
      reg.studentName || '',
      reg.email || '',
      reg.gender || '',
      reg.studentCollegeName || '',
      reg.branch || '',
      reg.course || '',
      reg.year || '',
      reg.mobno || '',
      reg.organizationName || '',
      formatDate(reg.createdAt)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 7 },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto'
    });

    doc.save("all_registrations_root_dashboard.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = registrations.map((reg, index) => ({
      "#": index + 1,
      "Registration ID": reg._id || '',
      "Event Name": reg.eventName || '',
      "Student Name": reg.studentName || '',
      "Email": reg.email || '',
      "Gender": reg.gender || '',
      "College": reg.studentCollegeName || '',
      "Branch": reg.branch || '',
      "Course": reg.course || '',
      "Year": reg.year || '',
      "Mobile": reg.mobno || '',
      "Organization": reg.organizationName || '',
      "Created At": formatDate(reg.createdAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "all_registrations_root_dashboard.xlsx");
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.studentCollegeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <button
                onClick={() => navigate('/root/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Registration Management</h1>
                <p className="text-sm text-gray-600">Manage all event registrations</p>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-orange-600">{registrations.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Registrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((reg) => (
            <div key={reg._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{reg.eventName}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{reg.studentName}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{reg.email}</span>
                  </div>
                  
                  {reg.gender && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Gender:</span> {reg.gender}
                    </div>
                  )}
                  
                  {reg.studentCollegeName && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">College:</span> {reg.studentCollegeName}
                    </div>
                  )}
                  
                  {reg.branch && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Branch:</span> {reg.branch}
                    </div>
                  )}
                  
                  {reg.course && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Course:</span> {reg.course}
                    </div>
                  )}
                  
                  {reg.year && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Year:</span> {reg.year}
                    </div>
                  )}
                  
                  {reg.mobno && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{reg.mobno}</span>
                    </div>
                  )}
                  
                  {reg.organizationName && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Organization:</span> {reg.organizationName}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 pt-2 border-t">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Registered {formatDate(reg.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-3 border-t">
                  <button
                    onClick={() => handleDeleteRegistration(reg._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    title="Delete Registration"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No registrations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RootRegistrations;