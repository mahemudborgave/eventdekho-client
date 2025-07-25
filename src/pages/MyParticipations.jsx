import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import { ScaleLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookmarkCheck, ShowerHead } from 'lucide-react';
import { Calendar, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Helper for Indian date-time format
function formatIndianDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }) + ' IST';
}

function MyParticipations() {
  const { user, email } = useContext(UserContext);
  const [registrations, setRegistrations] = useState([]);
  const [eventMap, setEventMap] = useState({});
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [textMsg, setTextMsg] = useState("You haven't registered for any events yet.");
  const MySwal = withReactContent(Swal);
  const [openDetailIdx, setOpenDetailIdx] = useState(null);

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      try {
        setLoading(true);  // Start loading before async calls

        const StoredToken = localStorage.getItem("token");
        if (!StoredToken) {
          setTextMsg("Log in to see the participations");
          setRegistrations([]);
          setEventMap({});
          return;
        }

        const verifyResponse = await axios.post(
          `${baseURL}:${port}/auth/verify`,
          {},
          { headers: { Authorization: `Bearer ${StoredToken}` } }
        );

        if (verifyResponse) {
          const res = await axios.post(`${baseURL}:${port}/eventt/geteventsfromemail`, { email });
          setRegistrations(res.data);
          // Fetch all events and build a map
          const allEventsRes = await axios.get(`${baseURL}:${port}/eventt/getevents`);
          const eventMapObj = {};
          for (const event of allEventsRes.data) {
            eventMapObj[event._id] = event;
          }
          setEventMap(eventMapObj);
        } else {
          setTextMsg("Invalid token, please login again.");
          setRegistrations([]);
          setEventMap({});
        }
      } catch (err) {
        console.error('Error:', err);
        setTextMsg("Something went wrong. Try again later.");
        setRegistrations([]);
        setEventMap({});
      } finally {
        setLoading(false);  // Always stop loading after all async calls
      }
    };

    if (email) {
      fetchUserRegistrations();
    } else {
      setLoading(false);
    }
  }, [email]);

  const handleDelete = async (eventId) => {
    const reg = registrations.find(r => r.eventId === eventId);
    console.log('[DEBUG] Registration for cancel:', reg);
    let result;
    if (reg && reg.fee && Number(reg.fee) > 0) {
      result = await MySwal.fire({
        title: 'Paid Event',
        text: 'This event is paid and the fee is non-refundable. Are you sure you want to cancel your registration?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Cancel Registration',
        cancelButtonText: 'Keep Registration',
        reverseButtons: true,
      });
    } else {
      result = await MySwal.fire({
        title: 'Cancel Registration',
        text: 'Are you sure you want to cancel your registration?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Cancel Registration',
        cancelButtonText: 'Keep Registration',
        reverseButtons: true,
      });
    }
    if (!result.isConfirmed) return;
    try {
      const res = await axios.post(`${baseURL}:${port}/eventt/deleteRegistration`, { eventId, email });
      if (res) {
        await MySwal.fire({
          title: 'Registration Cancelled',
          text: 'Your registration has been cancelled.',
          icon: 'success',
        });
        setRegistrations(prev => prev.filter(reg => reg.eventId !== eventId));
      }
    } catch (err) {
      console.error('Error deleting registration:', err);
      MySwal.fire('Error', 'Failed to delete registration. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 mb-100">
        <ScaleLoader />
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-start mb-6'>
        <h2 className="text-xl lg:text-2xl font-bold text-left border-b border-amber-600"><span className='text-amber-600'>My </span>Registrations</h2>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm lg:text-base'>
        {(registrations.length === 0) ? (
          <div className="text-center text-gray-500 mt-10 mb-120">
            {textMsg}
          </div>
        ) : registrations.map((reg, index) => {
          const eventDetail = eventMap[reg.eventId] || {};
          return (
            <div key={index} className='border p-4 rounded bg-white'>
              <div className='mb-2'>
                <p className='flex items-center gap-2 font-medium mb-1 capitalize'><BookmarkCheck /> {reg.eventName}</p>
                <p className='text-gray-700 text-sm'>{reg.organizationName}</p>
                <p className='text-gray-700 text-sm'>{reg.parentOrganization || ""}</p>
                <div className="flex flex-wrap gap-3 mt-2 mb-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-xs ${Number(reg.fee) > 0 ? 'bg-yellow-100 border border-yellow-400 text-yellow-800' : 'bg-green-100 border border-green-400 text-green-800'}`}>
                    {Number(reg.fee) > 0 ? `Amount Paid: ₹${reg.fee}` : 'FREE'}
                  </span>
                  {eventDetail.eventDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-800 font-semibold text-xs">
                      <Calendar size={13} className="mr-1" />
                      {new Date(eventDetail.eventDate).toLocaleDateString()}
                    </span>
                  )}
                  {eventDetail.eventMode && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-800 font-semibold text-xs">
                      <Info size={13} className="mr-1" />
                      {eventDetail.eventMode}
                    </span>
                  )}
                </div>
              </div>
              <div className='flex justify-start gap-3 items-center mt-3'>
                <Link className='lg:px-5 px-2 py-1 rounded-md border border-green-500 bg-green-500 text-white hover:bg-green-400'
                  to={`/eventdetail/${reg.eventId}`}>
                  Get Detail
                </Link>
                <button onClick={() => handleDelete(reg.eventId)}
                  className='lg:px-5 px-2 py-1 rounded-md border border-red-600 text-red-700 hover:bg-red-500 hover:text-white'>
                  Cancel Registration
                </button>
              </div>
              <p className='text-sm text-gray-500 mt-2'>
                Registered on: {formatIndianDateTime(reg.createdAt)}
              </p>
              <button
                  className='text-sm  text-blue-700 hover:bg-blue-500 hover:text-white underline'
                  onClick={() => setOpenDetailIdx(index)}
                >
                  View Registration Detail
                </button>
              {/* Registration Detail Modal */}
              <Dialog open={openDetailIdx === index} onOpenChange={v => setOpenDetailIdx(v ? index : null)}>
                <DialogContent className="max-w-lg w-full">
                  <DialogHeader>
                    <DialogTitle>Registration Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold text-base mb-2">Event: {reg.eventName}</div>
                    <div><span className="font-medium">Organization:</span> {reg.organizationName}</div>
                    {reg.parentOrganization && <div><span className="font-medium">Parent Organization:</span> {reg.parentOrganization}</div>}
                    {eventDetail.eventDate && <div><span className="font-medium">Event Date:</span> {new Date(eventDetail.eventDate).toLocaleDateString()}</div>}
                    {eventDetail.eventMode && <div><span className="font-medium">Event Type:</span> {eventDetail.eventMode}</div>}
                    <div className="mt-2 font-semibold">Main Participant</div>
                    <div><span className="font-medium">Name:</span> {reg.studentName}</div>
                    <div><span className="font-medium">Email:</span> {reg.email}</div>
                    <div><span className="font-medium">Gender:</span> {reg.gender}</div>
                    <div><span className="font-medium">College:</span> {reg.studentCollegeName}</div>
                    <div><span className="font-medium">Branch:</span> {reg.branch}</div>
                    <div><span className="font-medium">Course:</span> {reg.course}</div>
                    <div><span className="font-medium">Year:</span> {reg.year}</div>
                    <div><span className="font-medium">Mobile:</span> {reg.mobno}</div>
                    <div><span className="font-medium">Fee:</span> {Number(reg.fee) > 0 ? `₹${reg.fee}` : 'FREE'}</div>
                    {Array.isArray(reg.extraParticipants) && reg.extraParticipants.length > 0 && (
                      <div className="mt-3">
                        <div className="font-semibold mb-1">Extra Participants</div>
                        <div className="space-y-2">
                          {reg.extraParticipants.map((p, i) => (
                            <div key={i} className="border rounded p-2 bg-gray-50">
                              <div><span className="font-medium">Name:</span> {p.name}</div>
                              <div><span className="font-medium">Gender:</span> {p.gender}</div>
                              <div><span className="font-medium">Email:</span> {p.email}</div>
                              <div><span className="font-medium">Phone:</span> {p.phone}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}
      </div>
      <div className='h-100'></div>
    </div>
  );
}

export default MyParticipations;
