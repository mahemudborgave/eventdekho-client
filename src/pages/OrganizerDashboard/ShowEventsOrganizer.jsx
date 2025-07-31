import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { HashLoader, ScaleLoader } from 'react-spinners';
import UserContext from "../../context/UserContext";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileText, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

function ShowEventsOrganizer() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShow, setIsShow] = useState(false);
  const { email } = useContext(UserContext);
  const navigate = useNavigate();
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [queryCounts, setQueryCounts] = useState({});

  const truncate = (str, n) => (str && str.length > n ? str.slice(0, n) + '...' : str);

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    doc.text("Your Events (All Details)", 14, 16);
    const tableColumn = [
      "#", "Event ID", "Event Name", "Mode", "Club Name", "Parent Organization", "Email", "Event Date", "Location", "Posted On", "Closing On", "Tags", "Registrations", "Queries", "Created At", "Updated At"
    ];
    const tableRows = [];

    events.forEach((event, index) => {
      const eventData = [
        index + 1,
        event._id || '',
        event.eventName || '',
        event.eventMode || '',
        event.clubName || '',
        event.parentOrganization || '',
        event.email || '',
        formatDate(event.eventDate),
        event.eventLocation || '',
        formatDate(event.postedOn),
        formatDate(event.closeOn),
        Array.isArray(event.eventTags) ? event.eventTags.join(", ") : (event.eventTags || ''),
        registrationCounts[event._id] ?? '',
        queryCounts[event._id] ?? '',
        event.createdAt ? formatDate(event.createdAt) : '',
        event.updatedAt ? formatDate(event.updatedAt) : ''
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

    doc.save("events_all_details.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = events.map((event, index) => ({
      "#": index + 1,
      "Event ID": event._id || '',
      "Event Name": event.eventName || '',
      "Mode": event.eventMode || '',
      "Club Name": event.clubName || '',
      "Parent Organization": event.parentOrganization || '',
      "Email": event.email || '',
      "Event Date": formatDate(event.eventDate),
      "Location": event.eventLocation || '',
      "Posted On": formatDate(event.postedOn),
      "Closing On": formatDate(event.closeOn),
      "Tags": Array.isArray(event.eventTags) ? event.eventTags.join(", ") : (event.eventTags || ''),
      "Description": event.eventDescription || '',
      "Registrations": registrationCounts[event._id] ?? '',
      "Queries": queryCounts[event._id] ?? '',
      "Created At": event.createdAt ? formatDate(event.createdAt) : '',
      "Updated At": event.updatedAt ? formatDate(event.updatedAt) : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "events_all_details.xlsx");
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, ' ');
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`${baseURL}:${port}/eventt/deleteevent/${eventId}`);
      setEvents(events.filter(e => e._id !== eventId));
      toast.success("Event deleted successfully");
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  const handleUpdate = (event) => {
    navigate("/admin/addevent", { state: { event, isUpdate: true } });
  };

  useEffect(() => {
    const checkAuthAndFetchEvents = async () => {
      const storedToken = localStorage.getItem("token");
      let response;

      if (storedToken) {
        try {
          response = await axios.post(`${baseURL}:${port}/auth/verify`, {}, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });

          setIsShow(true);

          const res = await axios.get(`${baseURL}:${port}/eventt/getevents`);
          const userEvents = res.data.filter(event => event.email === email);
          setEvents(userEvents);

          // Fetch registration counts for each event
          const regCounts = {};
          const qCounts = {};
          await Promise.all(userEvents.map(async (event) => {
            try {
              const regRes = await axios.get(`${baseURL}:${port}/eventt/registrations/count/${event._id}`);
              regCounts[event._id] = regRes.data.count || 0;
            } catch {
              regCounts[event._id] = 0;
            }
            try {
              const queryRes = await axios.get(`${baseURL}:${port}/query/event/${event._id}`);
              qCounts[event._id] = Array.isArray(queryRes.data) ? queryRes.data.length : 0;
            } catch {
              qCounts[event._id] = 0;
            }
          }));
          setRegistrationCounts(regCounts);
          setQueryCounts(qCounts);

        } catch (err) {
          console.log("Error: ", err);
          toast.warn("Session expired. Please log in again.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuthAndFetchEvents();
  }, [email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <ScaleLoader />
      </div>
    );
  }

  return (
    <>
      {isShow ? (
        <div className="h-full bg-gray-50 dark:bg-gray-900 w-full lg:px-[50px] lg:p-8 p-4">
          <div className="mb-10 flex flex-col lg:flex-row justify-between bg-gradient-to-r from-red-100 to-red-400 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 p-4 rounded-xl">
            <h1 className="text-2xl font-bold tracking-tight mb-5 lg:mb-0 flex-1">
              <span className="text-[#BB4D00] dark:text-yellow-400">Your</span> events
            </h1> 
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex gap-3">
                <Button
                  onClick={exportToPDF}
                  className="flex gap-2 items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  <FileText size={20} />Export as PDF
                </Button>
                <Button
                  onClick={exportToExcel}
                  className="flex gap-2 items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  <FileSpreadsheet size={20} />Export as Excel
                </Button>
              </div>
            </div>
          </div>
          {events.length === 0 ? (
            <div className="text-center mt-20 text-gray-500 text-lg">
              You haven't posted any events yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider sticky left-0 z-10">#</th>
                    <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Event Name</th>
                    <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Mode</th>
                    <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Location</th>
                    <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Posted On</th>
                    <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Closing On</th>
                    <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {events.map((event, index) => (
                    <tr key={index} className="hover:bg-blue-100 dark:hover:bg-blue-900">
                      <td className="py-3 px-4 font-bold sticky left-0 z-10 bg-white dark:bg-gray-900 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{event.eventName}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{event.eventMode}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{event.eventLocation}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{formatDate(event.eventDate)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{formatDate(event.postedOn)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{formatDate(event.closeOn)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-nowrap gap-2 justify-center overflow-x-auto whitespace-nowrap">
                          <Link to={`/admin/eventdetail/${event._id}`} className="bg-blue-600 text-white rounded hover:bg-blue-700 px-3 py-1">Details</Link>
                          <Link to={`/admin/eventregistrationsadmin/${event._id}`} className="bg-green-600 text-white rounded hover:bg-green-700 px-3 py-1 flex items-center gap-1">
                            Registrations
                            <span className="ml-2 inline-block bg-green-200 text-green-700 font-bold px-2 py-0.5 rounded-full text-xs border border-green-500">
                              {registrationCounts[event._id] ?? '-'}
                            </span>
                          </Link>
                          <Link to={`/admin/eventqueries/${event._id}`} className="bg-purple-600 text-white rounded hover:bg-purple-700 px-3 py-1 flex items-center gap-1">
                            Queries
                            <span className="ml-2 inline-block bg-purple-200 text-purple-700 font-bold px-2 py-0.5 rounded-full text-xs border border-purple-500">
                              {queryCounts[event._id] ?? '-'}
                            </span>
                          </Link>
                          <button onClick={() => handleUpdate(event)} className="bg-yellow-500 text-white rounded hover:bg-yellow-600 px-3 py-1">Update</button>
                          <button onClick={() => handleDelete(event._id)} className="bg-red-600 text-white rounded hover:bg-red-700 px-3 py-1">Delete</button>
                        </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="block p-8 text-center text-red-700 underline">
          Log in to continue
        </Link>
      )}
    </>
  );
}

export default ShowEventsOrganizer;
