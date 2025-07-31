import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import UserContext from '../../context/UserContext';

function TransactionsOrganizer() {
  const { token } = useContext(UserContext);
  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseURL}:${port}/api/payment/organizer-transactions`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setTransactions(res.data);
      } catch (err) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [token]);

  return (
    <Card className="max-w-5xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>All Event Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-blue-600">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-500">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gradient-to-r from-yellow-200 to-orange-100 text-yellow-900">
                <tr>
                  <th className="px-4 py-2 text-left">Event ID</th>
                  <th className="px-4 py-2 text-left">Student Email</th>
                  <th className="px-4 py-2 text-left">Amount (₹)</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id} className="border-b last:border-0">
                    <td className="px-4 py-2">{tx.eventId}</td>
                    <td className="px-4 py-2">{tx.studentId}</td>
                    <td className="px-4 py-2">{tx.amount || 'N/A'}</td>
                    <td className="px-4 py-2 font-semibold text-green-700">{tx.status}</td>
                    <td className="px-4 py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionsOrganizer; 