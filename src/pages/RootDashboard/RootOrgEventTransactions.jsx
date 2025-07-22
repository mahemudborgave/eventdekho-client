import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { ThemeProvider } from '../../components/ui/ThemeProvider';
import { Loader2 } from 'lucide-react';

function RootOrgEventTransactions() {
  const { eventId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rootToken = localStorage.getItem('rootToken');
      // Fetch all transactions
      const txRes = await axios.get(`${baseURL}:${port}/root/transactions`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      // Filter by eventId
      const txs = (txRes.data || []).filter(tx => tx.eventId === eventId || tx.eventId?._id === eventId || tx.eventId?.toString() === eventId);
      setTransactions(txs);
      // Fetch event details
      const eventRes = await axios.get(`${baseURL}:${port}/root/events`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      const found = (eventRes.data || []).find(e => e._id === eventId);
      setEvent(found || null);
    } catch (err) {
      setTransactions([]);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-background sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-2 flex justify-between items-center h-16">
            <div>
              <h1 className="text-lg font-bold">Event Transactions</h1>
              {event && <div className="text-xs text-muted-foreground">{event.eventName}</div>}
              {event && event.upiId && (
                <div className="text-xs font-mono text-primary mt-1">UPI ID: {event.upiId}</div>
              )}
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-2 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
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
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Student Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">No transactions found</TableCell>
                      </TableRow>
                    ) : transactions.map(tx => (
                      <TableRow key={tx._id}>
                        <TableCell className="font-mono text-xs">{tx._id}</TableCell>
                        <TableCell>{tx.studentId}</TableCell>
                        <TableCell className="font-semibold">₹{(tx.amount/100).toLocaleString('en-IN')}</TableCell>
                        <TableCell>{tx.status}</TableCell>
                        <TableCell>{tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : ''}</TableCell>
                      </TableRow>
                    ))}
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

export default RootOrgEventTransactions; 