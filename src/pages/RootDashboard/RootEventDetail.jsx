import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Edit2, Save } from 'lucide-react';
import { ThemeProvider } from '../../components/ui/ThemeProvider';

function RootEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rootToken');
      const res = await axios.get(`${baseURL}:${port}/eventt/getevent/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(res.data);
    } catch (err) {
      toast.error('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm(event);
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('rootToken');
      await axios.put(`${baseURL}:${port}/eventt/updateevent/${eventId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Event updated');
      setEditOpen(false);
      fetchEvent();
    } catch (err) {
      toast.error('Failed to update event');
    }
  };

  if (loading) {
    return <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">Loading...</div>;
  }
  if (!event) {
    return <div className="min-h-[400px] flex items-center justify-center text-destructive">Event not found</div>;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 flex items-center h-16 gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/root/events')}><ArrowLeft className="h-5 w-5" /></Button>
              <h1 className="text-xl font-bold truncate">{event.eventName}</h1>
            </div>
            <Button variant="outline" size="icon" onClick={handleEdit}><Edit2 className="h-5 w-5" /></Button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="md:col-span-1 flex flex-col items-center justify-start">
              <div className="w-48 h-64 rounded-xl overflow-hidden shadow border bg-white flex items-center justify-center mb-4">
                {event.posterUrl ? (
                  <img src={event.posterUrl} alt="Poster" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-muted-foreground">No Poster</span>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="text-xs text-muted-foreground">Status</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'Live' ? 'bg-green-100 text-green-700' : event.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{event.status || '-'}</span>
                <div className="text-xs text-muted-foreground mt-2">Mode</div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">{event.eventMode || '-'}</span>
                <div className="text-xs text-muted-foreground mt-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(event.eventTags) && event.eventTags.length > 0 ? event.eventTags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-muted text-foreground rounded">{tag}</span>
                  )) : <span className="text-xs text-muted-foreground">-</span>}
                </div>
              </div>
            </div>
            {/* Details */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <Card className="shadow-none border bg-background">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Organization</div>
                      <div className="text-base font-medium">{event.organizationName}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Event Date</div>
                      <div className="text-base font-medium">{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Location</div>
                      <div className="text-base font-medium">{event.eventLocation}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Fee</div>
                      <div className="text-base font-medium">₹ {event.fee || 0}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Posted On</div>
                      <div className="text-base font-medium">{event.postedOn ? new Date(event.postedOn).toLocaleDateString() : '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Close On</div>
                      <div className="text-base font-medium">{event.closeOn ? new Date(event.closeOn).toLocaleDateString() : '-'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-none border bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">{event.eventDescription}</div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Event Details</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Update the event information below. All fields are required unless marked optional.</p>
              </DialogHeader>
              <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-5">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-base mb-2">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Name</label>
                      <Input value={editForm.eventName || ''} onChange={e => setEditForm({ ...editForm, eventName: e.target.value })} placeholder="Event Name" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea value={editForm.eventDescription || ''} onChange={e => setEditForm({ ...editForm, eventDescription: e.target.value })} placeholder="Event Description" minRows={3} required />
                      <span className="text-xs text-muted-foreground">Describe the event, agenda, and highlights.</span>
                    </div>
                  </div>
                </div>
                {/* Date & Location */}
                <div>
                  <h3 className="font-semibold text-base mb-2">Date & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Date</label>
                      <Input type="date" value={editForm.eventDate ? editForm.eventDate.slice(0, 10) : ''} onChange={e => setEditForm({ ...editForm, eventDate: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Close On</label>
                      <Input type="date" value={editForm.closeOn ? editForm.closeOn.slice(0, 10) : ''} onChange={e => setEditForm({ ...editForm, closeOn: e.target.value })} required />
                      <span className="text-xs text-muted-foreground">Last date for registration.</span>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <Input value={editForm.eventLocation || ''} onChange={e => setEditForm({ ...editForm, eventLocation: e.target.value })} placeholder="Event Location" required />
                    </div>
                  </div>
                </div>
                {/* Other Details */}
                <div>
                  <h3 className="font-semibold text-base mb-2">Other Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mode</label>
                      <Input value={editForm.eventMode || ''} onChange={e => setEditForm({ ...editForm, eventMode: e.target.value })} placeholder="Online / Offline / Hybrid" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fee (₹)</label>
                      <Input type="number" value={editForm.fee || 0} onChange={e => setEditForm({ ...editForm, fee: e.target.value })} min={0} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Tags <span className="text-xs text-muted-foreground">(comma separated)</span></label>
                      <Input value={Array.isArray(editForm.eventTags) ? editForm.eventTags.join(', ') : editForm.eventTags || ''} onChange={e => setEditForm({ ...editForm, eventTags: e.target.value.split(',').map(t => t.trim()) })} placeholder="e.g. hackathon, coding, workshop" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Poster URL <span className="text-xs text-muted-foreground">(optional)</span></label>
                      <Input value={editForm.posterUrl || ''} onChange={e => setEditForm({ ...editForm, posterUrl: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="default"><Save className="h-4 w-4 mr-1" /> Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default RootEventDetail; 