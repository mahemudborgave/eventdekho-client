import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { HashLoader } from 'react-spinners';
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Your Events", 14, 16);
    const tableColumn = ["#", "Event Name", "College", "Code", "Date", "Location", "Posted On", "Close On"];
    const tableRows = [];

    events.forEach((event, index) => {
      const eventData = [
        index + 1,
        event.eventName,
        event.collegeName,
        event.collegeCode,
        formatDate(event.eventDate),
        event.eventLocation,
        formatDate(event.postedOn),
        formatDate(event.closeOn),
      ];
      tableRows.push(eventData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("events.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = events.map((event, index) => ({
      "#": index + 1,
      "Event Name": event.eventName,
      "College": event.collegeName,
      "Code": event.collegeCode,
      "Date": formatDate(event.eventDate),
      "Location": event.eventLocation,
      "Posted On": formatDate(event.postedOn),
      "Close On": formatDate(event.closeOn),
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
        <HashLoader />
      </div>
    );
  }

  return (
    <>
      {isShow ? (
        <div className="h-full bg-[#F5F6FA] w-full px-[50px] pt-10">
          <div className="mb-5 flex justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Your events
            </h1>
            <div className="flex gap-3">
              <div className="flex gap-3">
                <button
                  onClick={exportToPDF}
                  className="flex gap-2 items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  <FileText size={20}/>Export as PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex gap-2 items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  <FileSpreadsheet size={20}/>Export as Excel
                </button>
              </div>

              <button className="bg-blue-500 text-white px-3 py-1 rounded mr-1 hover:bg-blue-600">
                1 - View Details
              </button>
              <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                2 - View Registrations
              </button>
            </div>
          </div>
          {events.length === 0 ? (
            <div className="text-center mt-20 text-gray-500 text-lg">
              You haven't posted any events yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-xl">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[15%]" />
                  <col className="w-[23%]" />
                  <col className="w-[8%]" />
                  <col className="w-[10%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[5%]" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-200 text-gray-600 text-sm leading-normal">
                    <th className="py-3 px-4 text-left">#</th>
                    <th className="py-3 px-6 text-left">Event Name</th>
                    <th className="py-3 px-6 text-left">College</th>
                    <th className="py-3 px-6 text-left">Code</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Location</th>
                    <th className="py-3 px-6 text-left">Posted On</th>
                    <th className="py-3 px-6 text-left">Close On</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {events.map((event, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-6">{event.eventName}</td>
                      <td className="py-3 px-6">{event.collegeName}</td>
                      <td className="py-3 px-6">{event.collegeCode}</td>
                      <td className="py-3 px-6">{formatDate(event.eventDate)}</td>
                      <td className="py-3 px-6">{event.eventLocation}</td>
                      <td className="py-3 px-6">{formatDate(event.postedOn)}</td>
                      <td className="py-3 px-6">{formatDate(event.closeOn)}</td>
                      <td className="py-3 px-6 text-center">
                        <Link
                          to={`/admin/eventdetail/${event._id}`}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          1
                        </Link>
                        <Link
                          to={`/admin/eventregistrationsadmin/${event._id}`}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          2
                        </Link>
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

export default ShowEventsAdmin;
