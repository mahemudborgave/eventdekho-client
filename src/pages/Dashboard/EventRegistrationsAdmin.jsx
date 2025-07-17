import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileText, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

function EventRegistrationsAdmin() {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventInfo, setEventInfo] = useState({ eventName: '', organizationName: '' });
  const [payments, setPayments] = useState([]);

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    const fetchRegistrationsAndEvent = async () => {
      try {
        const res = await axios.get(`${baseURL}:${port}/eventt/geteventregfromeventid/${eventId}`);
        const data = res.data || [];
        setRegistrations(data);
        console.log('[DEBUG] Registrations:', data);

        // Fetch event details for eventName and organizationName
        const eventRes = await axios.get(`${baseURL}:${port}/eventt/getevent/${eventId}`);
        const event = eventRes.data;
        console.log('[DEBUG] Event details:', event);
        setEventInfo({
          eventName: event.eventName || '',
          organizationName: event.organizationName || ''
        });
        
        // Fetch payments for this event
        const payRes = await axios.get(`${baseURL}:${port}/api/payment/organizer-transactions`, {
          params: { organizerEmail: event.email },
        });
        const allPayments = payRes.data || [];
        const eventPayments = allPayments.filter(p => {
          // Handle both string and ObjectId comparison
          const paymentEventId = p.eventId?.toString();
          const currentEventId = eventId?.toString();
          const match = paymentEventId === currentEventId;
          console.log('[DEBUG] Event ID matching:', {
            paymentEventId,
            currentEventId,
            match
          });
          return match;
        });
        console.log('[DEBUG] All payments:', allPayments);
        console.log('[DEBUG] Event payments:', eventPayments);
        console.log('[DEBUG] Event ID:', eventId);
        setPayments(eventPayments);
      } catch (err) {
        console.error('Error fetching registrations, event info, or payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationsAndEvent();
  }, [eventId]);

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    doc.setFontSize(16);
    doc.text(`Event: ${eventInfo.eventName}`, 14, 16);
    doc.text(`Organization: ${eventInfo.organizationName}`, 14, 26);

    const tableColumn = [
      "#", "Registration ID", "Name", "Email", "College", "Branch", "Year", "Course", "Gender", "Mobile", "Created At", "Updated At"
    ];
    const tableRows = registrations.map((reg, index) => [
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
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 36,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [220, 220, 220], textColor: 40, fontStyle: 'bold' },
      bodyStyles: { textColor: 30 },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
      theme: 'grid',
      didDrawPage: (data) => {
        // Optionally add page numbers or other header/footer
      }
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
    <div className="bg-white dark:bg-gray-900 p-4 md:p-8 rounded-xl">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-4 mb-6">
        <span className="text-2xl font-bold text-[#232946] dark:text-gray-100"><span className="text-[#BB4D00] dark:text-yellow-400">Event</span> Registrations</span>
        <div className="flex gap-3 mt-2 lg:mt-0">
          <Button onClick={exportToPDF} variant="destructive" className="flex gap-2 items-center">
              <FileText size={20} />Export as PDF
          </Button>
          <Button onClick={exportToExcel} variant="secondary" className="flex gap-2 items-center">
              <FileSpreadsheet size={20} />Export as Excel
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {eventInfo.eventName && (
          <p className="text-sm text-gray-700 dark:text-gray-200"><span className="font-medium">Event:</span> {eventInfo.eventName}</p>
        )}
        {eventInfo.organizationName && (
          <p className="text-sm text-gray-700 dark:text-gray-200"><span className="font-medium">College:</span> {eventInfo.organizationName}</p>
        )}
      </div>
      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : registrations.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">No registrations yet.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider sticky left-0 z-10">#</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">College</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Branch</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Year</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Course</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Gender</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Mobile</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Transaction ID</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Payment Status</th>
                </tr>
              </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {registrations.map((reg, index) => {
                const payment = payments.find(p => {
                  const match = p.studentId === reg.email;
                  console.log('[DEBUG] Payment matching:', {
                    paymentStudentId: p.studentId,
                    registrationEmail: reg.email,
                    match: match,
                    paymentId: p._id
                  });
                  return match;
                });
                return (
                  <tr key={reg._id} className="hover:bg-blue-100 dark:hover:bg-blue-900">
                    <td className="py-3 px-4 font-bold sticky left-0 z-10 bg-white dark:bg-gray-900 whitespace-nowrap">{index + 1}</td>
                    <td className="py-3 px-4 min-w-[120px] whitespace-nowrap text-gray-900 dark:text-gray-100">{reg.studentName}</td>
                    <td className="py-3 px-4 min-w-[120px] break-words w-full">{reg.email}</td>
                    <td className="py-3 px-4 min-w-[120px] whitespace-nowrap">{reg.studentCollegeName}</td>
                    <td className="py-3 px-4 min-w-[120px] break-words w-full">{reg.branch}</td>
                    <td className="py-3 px-4 min-w-[120px] break-words w-full">{reg.year}</td>
                    <td className="py-3 px-4 min-w-[120px] break-words w-full">{reg.course}</td>
                    <td className="py-3 px-4 min-w-[120px] break-words w-full">{reg.gender}</td>
                    <td className="py-3 px-4 min-w-[120px] break-words w-full">{reg.mobno}</td>
                    <td className="py-3 px-4 min-w-[120px] break-words w-full">{payment ? payment.razorpay_payment_id : 'N/A'}</td>
                    <td className="py-3 px-4 min-w-[120px] break-words w-full font-semibold">{payment ? payment.status : 'N/A'}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}

export default EventRegistrationsAdmin;
