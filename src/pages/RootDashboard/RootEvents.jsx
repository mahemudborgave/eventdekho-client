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
  Eye,
  LayoutGrid,
  Table2,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { ThemeProvider } from '../../components/ui/ThemeProvider';

function RootEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');
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

  // Remove the full-page loader
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b bg-background">
          <div className="max-w-7xl mx-auto px-2 flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/root/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-6 w-6 text-blue-600" />
              </span>
              <div>
                <h1 className="text-lg font-bold">All Events</h1>
                <p className="text-xs text-muted-foreground">System-wide event management</p>
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
        <main className="max-w-7xl mx-auto px-2 py-6 relative min-h-[400px]">
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="animate-spin w-12 h-12 text-primary" />
          </div>
        </main>
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
            <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Calendar className="h-6 w-6 text-blue-600" />
            </span>
            <div>
              <h1 className="text-lg font-bold">All Events</h1>
              <p className="text-xs text-muted-foreground">System-wide event management</p>
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
        {/* Search and Stats */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')} aria-label="Grid view" className={view === 'grid' ? 'ring-2 ring-primary' : ''}><LayoutGrid className="h-5 w-5" /></Button>
            <Button variant={view === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setView('table')} aria-label="Table view" className={view === 'table' ? 'ring-2 ring-primary' : ''}><Table2 className="h-5 w-5" /></Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {events.length} events
          </div>
        </div>
        {/* Events Table or Grid */}
        {view === 'table' ? (
          <div className="overflow-x-auto rounded-lg border mb-8">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="bg-muted sticky top-0 z-10">
                  <TableHead className="whitespace-nowrap">#</TableHead>
                  <TableHead className="whitespace-nowrap">Event Name</TableHead>
                  <TableHead className="whitespace-nowrap">Organization</TableHead>
                  <TableHead className="whitespace-nowrap">Mode</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Location</TableHead>
                  <TableHead className="whitespace-nowrap">Tags</TableHead>
                  <TableHead className="whitespace-nowrap">Registrations</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event, i) => (
                  <TableRow key={event._id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50 hover:bg-muted'}>
                    <TableCell className="whitespace-nowrap font-mono">{i + 1}</TableCell>
                    <TableCell className="whitespace-nowrap font-semibold">{event.eventName}</TableCell>
                    <TableCell className="whitespace-nowrap">{event.organizationName}</TableCell>
                    <TableCell className="whitespace-nowrap">{event.eventMode}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(event.eventDate)}</TableCell>
                    <TableCell className="whitespace-nowrap">{event.eventLocation}</TableCell>
                    <TableCell className="max-w-xs truncate" title={Array.isArray(event.eventTags) ? event.eventTags.join(', ') : event.eventTags}>{Array.isArray(event.eventTags) ? event.eventTags.slice(0, 3).join(', ') : event.eventTags}</TableCell>
                    <TableCell className="whitespace-nowrap">{event.registrationCount || 0}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button variant="link" size="sm" onClick={() => navigate(`/root/eventdetail/${event._id}`)} className="gap-1">
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="hover:shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold line-clamp-2">
                      {event.eventName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.eventMode === 'Online' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {event.eventMode}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.organizationName}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.eventLocation}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>
                    {event.eventTags && event.eventTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.eventTags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-muted text-foreground rounded">
                            {tag}
                          </span>
                        ))}
                        {event.eventTags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-muted text-foreground rounded">
                            +{event.eventTags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                      <span className="text-xs text-muted-foreground">
                        {event.registrationCount || 0} registrations
                      </span>
                      <Button variant="link" size="sm" onClick={() => navigate(`/root/eventdetail/${event._id}`)} className="gap-1">
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No events found</p>
          </div>
        )}
      </main>
    </ThemeProvider>
  );
}

export default RootEvents; 