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

function ShowEventsAdmin() {
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
      "#", "Event ID", "Event Name", "Mode", "Club Name", "College Name", "College Code", "City", "Org. Type", "Website", "Contact Person", "Phone", "Email", "Event Date", "Location", "Posted On", "Closing On", "Tags", "Description", "Registrations", "Queries", "Created At", "Updated At"
    ];
    const tableRows = [];

    events.forEach((event, index) => {
      const eventData = [
        index + 1,
        event._id || '',
        event.eventName || '',
        event.eventMode || '',
        event.clubName || '',
        event.organizationName || '',
        event.collegeCode || '',
        event.collegeCity || '',
        event.organizationType || '',
        event.website || '',
        event.contactPerson || '',
        event.phone || '',
        event.email || '',
        formatDate(event.eventDate),
        event.eventLocation || '',
        formatDate(event.postedOn),
        formatDate(event.closeOn),
        Array.isArray(event.eventTags) ? event.eventTags.join(", ") : (event.eventTags || ''),
        event.eventDescription || '',
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
      "College Name": event.collegeName || '',
      "College Code": event.collegeCode || '',
      "City": event.collegeCity || '',
      "Org. Type": event.organizationType || '',
      "Website": event.website || '',
      "Contact Person": event.contactPerson || '',
      "Phone": event.phone || '',
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
        <div className="h-full bg-[#F5F6FA] w-full lg:px-[50px] lg:p-8 p-4">
          <div className="mb-10 flex flex-col lg:flex-row justify-between bg-gradient-to-r from-red-100 to-red-400 p-4">
            <h1 className="text-2xl font-bold tracking-tight mb-5 lg:mb-0 flex-1">
              <span className="text-[#BB4D00]">Your</span> events
            </h1> 
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex gap-3">
                <button
                  onClick={exportToPDF}
                  className="flex gap-2 items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  <FileText size={20} />Export as PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex gap-2 items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  <FileSpreadsheet size={20} />Export as Excel
                </button>
              </div>
            </div>
          </div>
          {events.length === 0 ? (
            <div className="text-center mt-20 text-gray-500 text-lg">
              You haven't posted any events yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="inline-block min-w-max">
                <table className="table-auto bg-white shadow-md rounded-xl">
                  {/* <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[15%]" />
                  <col className="w-[23%]" />
                  <col className="w-[8%]" />
                  <col className="w-[10%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[5%]" />
                </colgroup> */}
                  <thead>
                    <tr className="bg-gray-200 text-gray-600 text-sm leading-normal uppercase">
                      <th className="py-3 px-4 text-left sticky left-0 z-10 bg-gray-200">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Event Name</th>
                      {/* <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">College</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Club</th> */}
                      <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Posted On</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Closing On</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm">
                    {events.map((event, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-blue-100">
                        <td className="py-3 px-4 sticky left-0 z-10 bg-white">{index + 1}</td>
                        <td className="py-3 px-6">{event.eventName}</td>
                        {/* <td className="py-3 px-6 max-w-[500px] truncate" title={event.collegeName}>
                          {event.collegeName}
                        </td> */}
                        {/* <td className="py-3 px-6">{event.clubName}</td> */}
                        <td className="py-3 px-6">{event.eventMode}</td>
                        <td className="py-3 px-6">{event.eventLocation}</td>
                        <td className="py-3 px-6">{formatDate(event.eventDate)}</td>
                        <td className="py-3 px-6">{formatDate(event.postedOn)}</td>
                        <td className="py-3 px-6">{formatDate(event.closeOn)}</td>
                        <td className="py-3 px-6 text-center">
                          <Link
                            to={`/admin/eventdetail/${event._id}`}
                            className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                          >
                            Details
                          </Link>
                          <Link
                            to={`/admin/eventregistrationsadmin/${event._id}`}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 relative"
                          >
                            Registrations
                            <span className="ml-2 inline-block bg-green-200 text-green-700 font-bold px-2 py-0.5 rounded-full text-xs border border-green-500">
                              {registrationCounts[event._id] ?? '-'}
                            </span>
                          </Link>
                          <Link
                            to={`/admin/eventqueries/${event._id}`}
                            className="bg-purple-500 text-white px-3 py-1 rounded ml-2 hover:bg-purple-600 relative"
                          >
                            Queries
                            <span className="ml-2 inline-block bg-purple-200 text-purple-700 font-bold px-2 py-0.5 rounded-full text-xs border border-purple-500">
                              {queryCounts[event._id] ?? '-'}
                            </span>
                          </Link>
                          <button
                            onClick={() => handleUpdate(event)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded ml-2 hover:bg-yellow-600"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded ml-2 hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

export default ShowEventsAdmin;
