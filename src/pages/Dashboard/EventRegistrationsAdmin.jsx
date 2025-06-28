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

    const tableColumn = [
      "#", "Registration ID", "Name", "Email", "College", "Branch", "Year", "Course", "Gender", "Mobile", "Created At", "Updated At"
    ];
    const tableRows = [];

    registrations.forEach((reg, index) => {
      const rowData = [
        index + 1,
        reg._id || '',
        reg.studentName || '',
        reg.email || '',
        reg.studentCollegeName || '',
        reg.branch || '',
        reg.year || '',
        reg.course || '',
        reg.gender || '',
        reg.mobno || '',
        reg.createdAt ? new Date(reg.createdAt).toLocaleString() : '',
        reg.updatedAt ? new Date(reg.updatedAt).toLocaleString() : ''
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("event_registrations_all_details.pdf");
  };

  const exportToExcel = () => {
    const worksheetData = registrations.map((reg, index) => ({
      "#": index + 1,
      "Registration ID": reg._id || '',
      "Name": reg.studentName || '',
      "Email": reg.email || '',
      "College": reg.studentCollegeName || '',
      "Branch": reg.branch || '',
      "Year": reg.year || '',
      "Course": reg.course || '',
      "Gender": reg.gender || '',
      "Mobile": reg.mobno || '',
      "Created At": reg.createdAt ? new Date(reg.createdAt).toLocaleString() : '',
      "Updated At": reg.updatedAt ? new Date(reg.updatedAt).toLocaleString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "event_registrations_all_details.xlsx");
  };

  return (
    <div className='p-4 lg:p-10'>
      <div className="mb-6">
        <div className='flex flex-col lg:flex-row justify-between bg-gradient-to-r from-red-100 to-red-400 p-4 mb-10'>
          <h2 className="text-2xl font-bold text-[#232946]"><span className="text-[#BB4D00]">Event</span> Registrations</h2>
          <div className="flex gap-3 mt-5 lg:mt-0">
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
          <p className="text-sm text-gray-700 lg:mt-2 mt-4">
            <span className="font-medium">Event:</span> {eventInfo.eventName}
          </p>
        )}
        {eventInfo.collegeName && (
          <p className="text-sm text-gray-700 inline-block">
            <span className="font-medium">College:</span> {eventInfo.collegeName}
          </p>
        )}

      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : registrations.length === 0 ? (
        <div className="text-gray-500">No registrations yet.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="inline-block min-w-max">
            <table className="table-auto bg-white shadow-md rounded-xl">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-sm leading-normal">
                  <th className="py-3 px-2 text-left sticky left-0 z-10 bg-gray-200">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold bg-gray-200 text-gray-600 uppercase tracking-wider">Mobile</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {registrations.map((reg, index) => (
                  <tr key={reg._id} className="border-b border-gray-200 hover:bg-blue-100">
                    <td className="py-3 px-2 sticky left-0 z-10 bg-white">{index + 1}</td>
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
        </div>
      )}
    </div>
  );
}

export default EventRegistrationsAdmin;
