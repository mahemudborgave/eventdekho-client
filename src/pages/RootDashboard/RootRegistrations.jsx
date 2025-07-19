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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ThemeProvider } from '../../components/ui/ThemeProvider';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {/* Header */}
      <header className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-2 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/root/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <FileText className="h-6 w-6 text-orange-600" />
            </span>
            <div>
              <h1 className="text-lg font-bold">Registration Management</h1>
              <p className="text-xs text-muted-foreground">Manage all event registrations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-1">
              <FileText className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-1">
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-2 py-6">
        {/* Stats */}
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <div className="text-xs text-muted-foreground">Total Registrations</div>
              <div className="text-lg font-bold text-orange-600">{registrations.length}</div>
            </div>
            <FileText className="h-6 w-6 text-orange-600" />
          </CardContent>
        </Card>
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        {/* Registrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRegistrations.map((reg) => (
            <Card key={reg._id} className="hover:shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="text-base font-semibold mb-1">{reg.eventName}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    <span>{reg.studentName}</span>
                  </div>
                </div>
                <div className="space-y-1 mb-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>{reg.email}</span>
                  </div>
                  {reg.gender && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Gender:</span> {reg.gender}
                    </div>
                  )}
                  {reg.studentCollegeName && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">College:</span> {reg.studentCollegeName}
                    </div>
                  )}
                  {reg.branch && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Branch:</span> {reg.branch}
                    </div>
                  )}
                  {reg.course && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Course:</span> {reg.course}
                    </div>
                  )}
                  {reg.year && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Year:</span> {reg.year}
                    </div>
                  )}
                  {reg.mobno && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{reg.mobno}</span>
                    </div>
                  )}
                  {reg.organizationName && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Organization:</span> {reg.organizationName}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Registered {formatDate(reg.createdAt)}</span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end pt-2 border-t mt-2">
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteRegistration(reg._id)} title="Delete Registration">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No registrations found</p>
          </div>
        )}
      </main>
    </ThemeProvider>
  );
}

export default RootRegistrations;