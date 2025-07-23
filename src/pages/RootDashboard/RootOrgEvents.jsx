import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { ThemeProvider } from '../../components/ui/ThemeProvider';
import { Loader2 } from 'lucide-react';

function RootOrgEvents() {
  const { email } = useParams();
  const [orgDetails, setOrgDetails] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    fetchOrgEvents();
    // eslint-disable-next-line
  }, [email]);

  const fetchOrgEvents = async () => {
    setLoading(true);
    try {
      const rootToken = localStorage.getItem('rootToken');
      // Fetch org details and events
      const res = await axios.get(`${baseURL}:${port}/root/organizations/${email}`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      setOrgDetails(res.data.organization);
      setOrgEvents(res.data.events);
      // Fetch all transactions
      const txRes = await axios.get(`${baseURL}:${port}/root/transactions`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      setTransactions(txRes.data || []);
    } catch (err) {
      setOrgDetails(null);
      setOrgEvents([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get transaction count and total charges for an event
  const getEventTxStats = (eventId) => {
    const txs = transactions.filter(tx => tx.eventId === eventId || tx.eventId?._id === eventId || tx.eventId?.toString() === eventId);
    const count = txs.length;
    const total = txs.reduce((sum, tx) => typeof tx.amount === 'number' ? sum + tx.amount : sum, 0);
    return { count, total };
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-background sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-2 flex justify-between items-center h-16">
            <div>
              <h1 className="text-lg font-bold">Events for {orgDetails?.organizationName || email}</h1>
              <div className="text-xs text-muted-foreground">{orgDetails?.email}</div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-2 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin w-8 h-8 text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>UPI ID</TableHead>
                      <TableHead>Total Amount Received</TableHead>
                      <TableHead>Transaction Count</TableHead>
                      <TableHead>Event Fee (₹)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgEvents.map(event => {
                      const { count, total } = getEventTxStats(event._id);
                      return (
                        <TableRow key={event._id}>
                          <TableCell>{event.eventName}</TableCell>
                          <TableCell>{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''}</TableCell>
                          <TableCell>{event.eventLocation}</TableCell>
                          <TableCell>{event.fee && event.fee > 0 ? 'Paid' : 'Free'}</TableCell>
                          <TableCell className="font-mono text-xs">{event.upiId || '-'}</TableCell>
                          <TableCell className="font-semibold">₹{(event.totalAmountReceived/100).toLocaleString('en-IN')}</TableCell>
                          <TableCell>{count}</TableCell>
                          <TableCell>₹{event.fee ? (event.fee).toLocaleString('en-IN') : '0'}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/root/org-event-transactions/${event._id}`)}>View Transactions</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default RootOrgEvents; 