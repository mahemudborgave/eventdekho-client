import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileText, FileSpreadsheet } from "lucide-react";

function EventRegistrationsAdmin() {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventInfo, setEventInfo] = useState({ eventName: '', collegeName: '' });

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/geteventregfromeventid/${eventId}`);
        const data = res.data || [];
        setRegistrations(data);

        if (data.length > 0) {
          const { eventName, eventCollegeName } = data[0];
          setEventInfo({ eventName, collegeName: eventCollegeName });
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [eventId]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Event: ${eventInfo.eventName}`, 14, 16);
    doc.text(`College: ${eventInfo.collegeName}`, 14, 24);

    const tableColumn = ["#", "Name", "Email", "College", "Branch", "Year", "Course", "Gender", "Mobile"];
    const tableRows = [];

    registrations.forEach((reg, index) => {
      const rowData = [
        index + 1,
        reg.studentName,
        reg.email,
        reg.studentCollegeName,
        reg.branch,
        reg.year,
        reg.course,
        reg.gender,
        reg.mobno
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("event_registrations.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = registrations.map((reg, index) => ({
      "#": index + 1,
      Name: reg.studentName,
      Email: reg.email,
      College: reg.studentCollegeName,
      Branch: reg.branch,
      Year: reg.year,
      Course: reg.course,
      Gender: reg.gender,
      Mobile: reg.mobno
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "event_registrations.xlsx");
  };

  return (
    <div className='mx-[100px] py-10'>
      <div className="mb-6">
        <div className='flex justify-between'>
          <h2 className="text-xl font-semibold text-[#232946] mb-5">Event Registrations</h2>
          <div className="flex mt-4 space-x-3">
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
        {eventInfo.eventName && (
          <p className="text-sm text-gray-700 mt-2 inline-block">
            <span className="font-medium">Event:</span> {eventInfo.eventName}
          </p>
        )}
        {eventInfo.collegeName && (
          <p className="text-sm text-gray-700 inline-block ml-5">
            <span className="font-medium">College:</span> {eventInfo.collegeName}
          </p>
        )}

      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : registrations.length === 0 ? (
        <div className="text-gray-500">No registrations yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl">
            <thead>
              <tr className="bg-gray-200 text-gray-600 text-sm leading-normal">
                <th className="py-3 px-2 text-left">#</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">College</th>
                <th className="py-3 px-4 text-left">Branch</th>
                <th className="py-3 px-4 text-left">Year</th>
                <th className="py-3 px-4 text-left">Course</th>
                <th className="py-3 px-4 text-left">Gender</th>
                <th className="py-3 px-4 text-left">Mobile</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {registrations.map((reg, index) => (
                <tr key={reg._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-2">{index + 1}</td>
                  <td className="py-3 px-4">{reg.studentName}</td>
                  <td className="py-3 px-4">{reg.email}</td>
                  <td className="py-3 px-4">{reg.studentCollegeName}</td>
                  <td className="py-3 px-4">{reg.branch}</td>
                  <td className="py-3 px-4">{reg.year}</td>
                  <td className="py-3 px-4">{reg.course}</td>
                  <td className="py-3 px-4">{reg.gender}</td>
                  <td className="py-3 px-4">{reg.mobno}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EventRegistrationsAdmin;
