import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ThemeProvider } from '../../components/ui/ThemeProvider';
import { Loader2 } from 'lucide-react';

function RootOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [eventCounts, setEventCounts] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (organizations.length > 0) {
      fetchEventCounts();
    }
    // eslint-disable-next-line
  }, [organizations]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const rootToken = localStorage.getItem('rootToken');
      const res = await axios.get(`${baseURL}:${port}/root/users`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      setOrganizations(res.data.organizations || []);
    } catch (err) {
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventCounts = async () => {
    setLoadingCounts(true);
    const counts = {};
    const rootToken = localStorage.getItem('rootToken');
    await Promise.all(
      organizations.map(async (org) => {
        try {
          const res = await axios.get(`${baseURL}:${port}/root/organizations/${org.email}`, {
            headers: { Authorization: `Bearer ${rootToken}` }
          });
          counts[org.email] = res.data.events.length;
        } catch {
          counts[org.email] = 0;
        }
      })
    );
    setEventCounts(counts);
    setLoadingCounts(false);
  };

  const handleOrgClick = (org) => {
    navigate(`/root/org-events/${encodeURIComponent(org.email)}`);
  };

  const filteredOrgs = organizations.filter(org =>
    org.organizationName?.toLowerCase().includes(search.toLowerCase()) ||
    org.email?.toLowerCase().includes(search.toLowerCase()) ||
    org.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-background sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-2 flex justify-between items-center h-16">
            <h1 className="text-lg font-bold">Organizations</h1>
            <Input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-2 py-6">
          <div className="overflow-x-auto rounded-lg border bg-background">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="bg-muted sticky top-0 z-10">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Event Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org, i) => (
                  <TableRow key={org._id}>
                    <TableCell>{org.organizationName}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>{org.city}</TableCell>
                    <TableCell>{org.organizationType}</TableCell>
                    <TableCell>{org.phone}</TableCell>
                    <TableCell>
                      {loadingCounts ? <Loader2 className="animate-spin w-4 h-4 inline-block" /> : (eventCounts[org.email] ?? 0)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleOrgClick(org)}>
                        View Events
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default RootOrganizations; 