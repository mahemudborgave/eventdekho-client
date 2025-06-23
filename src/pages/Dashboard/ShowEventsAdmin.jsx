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

  const truncate = (str, n) => (str && str.length > n ? str.slice(0, n) + '...' : str);

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    doc.text("Your Events", 14, 16);
    const tableColumn = [
      "#", "Event Name", "Mode", "College", "Code", "City", "Date", "Location", "Posted On", "Closing On", "Tags", "Description"
    ];
    const tableRows = [];

    events.forEach((event, index) => {
      const eventData = [
        index + 1,
        truncate(event.eventName, 30),
        event.eventMode,
        truncate(event.collegeName, 40),
        event.collegeCode,
        event.collegeCity,
        formatDate(event.eventDate),
        truncate(event.eventLocation, 20),
        formatDate(event.postedOn),
        formatDate(event.closeOn),
        truncate(Array.isArray(event.eventTags) ? event.eventTags.join(", ") : event.eventTags, 25),
        truncate(event.eventDescription, 50)
      ];
      tableRows.push(eventData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 18 },
        3: { cellWidth: 50, overflow: 'linebreak' },
        4: { cellWidth: 16 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 },
        7: { cellWidth: 28 },
        8: { cellWidth: 22 },
        9: { cellWidth: 22 },
        10: { cellWidth: 30, overflow: 'linebreak' },
        11: { cellWidth: 40, overflow: 'linebreak' },
      },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto'
    });

    doc.save("events.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = events.map((event, index) => ({
      "#": index + 1,
      "Event Name": event.eventName,
      "Mode": event.eventMode,
      "College": event.collegeName,
      "Code": event.collegeCode,
      "City": event.collegeCity,
      "Date": formatDate(event.eventDate),
      "Location": event.eventLocation,
      "Posted On": formatDate(event.postedOn),
      "Closing On": formatDate(event.closeOn),
      "Tags": Array.isArray(event.eventTags) ? event.eventTags.join(", ") : event.eventTags,
      "Description": event.eventDescription,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "events.xlsx");
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
          response = await axios.post(`${baseURL}:${port}/userauth/verifytoken`, {}, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });

          setIsShow(true);

          const res = await axios.get(`${baseURL}:${port}/eventt/getevents`);
          const userEvents = res.data.filter(event => event.email === email);
          setEvents(userEvents);

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
                    <tr className="bg-gray-200 text-gray-600 text-sm leading-normal">
                      <th className="py-3 px-4 text-left sticky left-0 z-10 bg-gray-200">#</th>
                      <th className="py-3 px-6 text-left">Event Name</th>
                      <th className="py-3 px-6 text-left">College</th>
                      <th className="py-3 px-6 text-left">Mode</th>
                      <th className="py-3 px-6 text-left">Location</th>
                      <th className="py-3 px-6 text-left">Date</th>
                      <th className="py-3 px-6 text-left">Posted On</th>
                      <th className="py-3 px-6 text-left">Closing On</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm">
                    {events.map((event, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-blue-100">
                        <td className="py-3 px-4 sticky left-0 z-10 bg-white">{index + 1}</td>
                        <td className="py-3 px-6">{event.eventName}</td>
                        <td className="py-3 px-6 max-w-[500px] truncate" title={event.collegeName}>
                          {event.collegeName}
                        </td>
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
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Registrations
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
