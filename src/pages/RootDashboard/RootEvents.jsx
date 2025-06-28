import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  FileText, 
  FileSpreadsheet,
  Calendar,
  MapPin,
  Users,
  Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function RootEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    checkAuthAndFetchEvents();
  }, []);

  const checkAuthAndFetchEvents = async () => {
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

      // Fetch events
      const response = await axios.get(`${baseURL}:${port}/root/events`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      setEvents(response.data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('rootToken');
        localStorage.removeItem('rootUser');
        toast.error('Session expired. Please login again.');
        navigate('/root/login');
      } else {
        toast.error('Failed to fetch events');
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

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    doc.text("All Events - Root Dashboard", 14, 16);
    
    const tableColumn = [
      "#", "Event ID", "Event Name", "Organization", "Organization ID", "City", "Mode", "Date", "Location", "Posted On", "Closing On", "Tags", "Description", "Registrations"
    ];
    const tableRows = [];

    events.forEach((event, index) => {
      const eventData = [
        index + 1,
        event._id || '',
        event.eventName || '',
        event.organizationName || '',
        event.organizationId || '',
        event.organizationCity || '',
        event.eventMode || '',
        formatDate(event.eventDate),
        event.eventLocation || '',
        formatDate(event.postedOn),
        formatDate(event.closeOn),
        Array.isArray(event.eventTags) ? event.eventTags.join(", ") : (event.eventTags || ''),
        event.eventDescription || '',
        event.registrationCount || 0
      ];
      tableRows.push(eventData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 7 },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto'
    });

    doc.save("all_events_root_dashboard.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = events.map((event, index) => ({
      "#": index + 1,
      "Event ID": event._id || '',
      "Event Name": event.eventName || '',
      "Organization": event.organizationName || '',
      "Organization ID": event.organizationId || '',
      "City": event.organizationCity || '',
      "Mode": event.eventMode || '',
      "Date": formatDate(event.eventDate),
      "Location": event.eventLocation || '',
      "Posted On": formatDate(event.postedOn),
      "Closing On": formatDate(event.closeOn),
      "Tags": Array.isArray(event.eventTags) ? event.eventTags.join(", ") : (event.eventTags || ''),
      "Description": event.eventDescription || '',
      "Registrations": event.registrationCount || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Events");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "all_events_root_dashboard.xlsx");
  };

  const filteredEvents = events.filter(event =>
    event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizationCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventLocation?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">All Events</h1>
                <p className="text-sm text-gray-600">System-wide event management</p>
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
        {/* Search and Stats */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.eventName}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.eventMode === 'Online' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {event.eventMode}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.organizationName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.eventLocation}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>

                  {event.eventTags && event.eventTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.eventTags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {tag}
                        </span>
                      ))}
                      {event.eventTags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{event.eventTags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-sm text-gray-500">
                      {event.registrationCount || 0} registrations
                    </span>
                    <button
                      onClick={() => navigate(`/event/${event._id}`)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RootEvents; 