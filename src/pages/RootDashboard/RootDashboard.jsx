import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  LogOut, 
  Eye, 
  UserCheck, 
  Settings,
  TrendingUp,
  Activity,
  X, Edit2, Trash2, Save, Search, Loader2
} from 'lucide-react';
import FeaturedImagesManager from '../../components/Dashboard/FeaturedImagesManager';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import ThemeSwitcher from '../../components/ui/ThemeSwitcher';
import { Input } from '../../components/ui/input';
import { ThemeProvider } from '../../components/ui/ThemeProvider';

function RootDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  // Transaction history state
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const adminEmail = localStorage.getItem('rootUser') || '';

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    checkAuthAndFetchStats();
  }, []);

  useEffect(() => {
    if (tab === 'transactions') {
      const fetchTransactions = async () => {
        setLoadingTx(true);
        try {
          const res = await axios.get(`${baseURL}:${port}/root/transactions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('rootToken')}` }
          });
          setTransactions(res.data);
        } catch (err) {
          console.error('Failed to fetch transactions:', err);
        } finally {
          setLoadingTx(false);
        }
      };
      fetchTransactions();
    }
  }, [tab, baseURL, port]);

  // Queries state
  const [queries, setQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [editQuery, setEditQuery] = useState(null); // { ...query }
  const [editResolution, setEditResolution] = useState('');
  const [deleteQueryId, setDeleteQueryId] = useState(null);

  useEffect(() => {
    if (tab === 'queries') {
      const fetchQueries = async () => {
        setLoadingQueries(true);
        try {
          const res = await axios.get(`${baseURL}:${port}/root/queries`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('rootToken')}` }
          });
          setQueries(res.data);
        } catch (err) {
          console.error('Failed to fetch queries:', err);
        } finally {
          setLoadingQueries(false);
        }
      };
      fetchQueries();
    }
  }, [tab, baseURL, port]);

  const handleEditQuery = (query) => {
    setEditQuery(query);
    setEditResolution(query.resolution || '');
  };
  const handleSaveResolution = async () => {
    if (!editQuery) return;
    try {
      await axios.post(`${baseURL}:${port}/query/respond/${editQuery._id}`, { resolution: editResolution }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('rootToken')}` }
      });
      toast.success('Resolution updated');
      setEditQuery(null);
      setEditResolution('');
      // Refresh queries
      const res = await axios.get(`${baseURL}:${port}/root/queries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('rootToken')}` }
      });
      setQueries(res.data);
    } catch (err) {
      toast.error('Failed to update resolution');
    }
  };
  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
      await axios.delete(`${baseURL}:${port}/query/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('rootToken')}` }
      });
      toast.success('Query deleted');
      // Refresh queries
      const res = await axios.get(`${baseURL}:${port}/root/queries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('rootToken')}` }
      });
      setQueries(res.data);
    } catch (err) {
      toast.error('Failed to delete query');
    }
  };

  const checkAuthAndFetchStats = async () => {
    const rootToken = localStorage.getItem('rootToken');
    
    if (!rootToken) {
      toast.error('Access denied. Please login as root.');
      navigate('/root/login');
      return;
    }

    try {
      // Verify token
      await axios.post(`${baseURL}:${port}/root/verify`, {}, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      // Fetch stats
      const response = await axios.get(`${baseURL}:${port}/root/stats`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('rootToken');
        localStorage.removeItem('rootUser');
        toast.error('Session expired. Please login again.');
        navigate('/root/login');
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rootToken');
    localStorage.removeItem('rootUser');
    toast.success('Logged out successfully');
    navigate('/root/login');
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:scale-105 ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const NavigationCard = ({ title, description, icon: Icon, color, path }) => (
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
      onClick={() => navigate(path)}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  // Transactions search
  const [txSearch, setTxSearch] = useState('');
  const [debouncedTxSearch, setDebouncedTxSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTxSearch(txSearch), 250);
    return () => clearTimeout(handler);
  }, [txSearch]);
  const filteredTransactions = transactions.filter(tx => {
    const s = debouncedTxSearch.toLowerCase();
    return (
      tx.eventId?.toString().toLowerCase().includes(s) ||
      tx.studentId?.toLowerCase().includes(s) ||
      tx.status?.toLowerCase().includes(s) ||
      tx.razorpay_payment_id?.toLowerCase().includes(s) ||
      tx.razorpay_order_id?.toLowerCase().includes(s) ||
      new Date(tx.createdAt).toLocaleString().toLowerCase().includes(s)
    );
  });
  // Queries search
  const [querySearch, setQuerySearch] = useState('');
  const [debouncedQuerySearch, setDebouncedQuerySearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuerySearch(querySearch), 250);
    return () => clearTimeout(handler);
  }, [querySearch]);
  const filteredQueries = queries.filter(q => {
    const s = debouncedQuerySearch.toLowerCase();
    return (
      q.eventId?.toString().toLowerCase().includes(s) ||
      q.eventName?.toLowerCase().includes(s) ||
      q.userEmail?.toLowerCase().includes(s) ||
      q.userName?.toLowerCase().includes(s) ||
      q.message?.toLowerCase().includes(s) ||
      q.resolution?.toLowerCase().includes(s) ||
      new Date(q.createdAt).toLocaleString().toLowerCase().includes(s)
    );
  });

  return (
    <ThemeProvider>
      {loading ? (
        <div className="min-h-screen bg-background text-foreground">
          {/* Header */}
          <header className="border-b bg-background">
            <div className="max-w-7xl mx-auto px-2 flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-muted">
                  <Settings className="h-6 w-6 text-primary" />
                </span>
                <div>
                  <h1 className="text-lg font-bold">Root Dashboard</h1>
                  <p className="text-xs text-muted-foreground">System Administration</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-2 py-6 relative min-h-[400px]">
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-lg">
              <Loader2 className="animate-spin w-12 h-12 text-primary" />
            </div>
          </main>
        </div>
      ) : (
        <div className="min-h-screen bg-background text-foreground">
          {/* Header */}
          <header className="border-b bg-background">
            <div className="max-w-7xl mx-auto px-2 flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-muted">
                  <Settings className="h-6 w-6 text-primary" />
                </span>
                <div>
                  <h1 className="text-lg font-bold">Root Dashboard</h1>
                  <p className="text-xs text-muted-foreground">System Administration</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-2 py-6">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="mb-4 w-full flex gap-2">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="queries">Queries</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <div className="mb-6">
                  <FeaturedImagesManager />
                </div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">System Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card onClick={() => navigate('/root/events')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-2 p-3">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="text-lg font-bold">{stats?.totalEvents || 0}</div>
                          <div className="text-xs text-muted-foreground">Total Events</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => navigate('/root/users')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-2 p-3">
                        <Users className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="text-lg font-bold">{stats?.totalStudents || 0}</div>
                          <div className="text-xs text-muted-foreground">Total Students</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => navigate('/root/users')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-2 p-3">
                        <UserCheck className="h-6 w-6 text-purple-600" />
                        <div>
                          <div className="text-lg font-bold">{stats?.totalOrganizations || 0}</div>
                          <div className="text-xs text-muted-foreground">Total Organizations</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => navigate('/root/registrations')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-2 p-3">
                        <FileText className="h-6 w-6 text-orange-600" />
                        <div>
                          <div className="text-lg font-bold">{stats?.totalRegistrations || 0}</div>
                          <div className="text-xs text-muted-foreground">Total Registrations</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Quick Access</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Card onClick={() => navigate('/root/events')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-3 p-3">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="font-semibold">All Events</div>
                          <div className="text-xs text-muted-foreground">View and manage all events</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => navigate('/root/users')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-3 p-3">
                        <Users className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="font-semibold">All Users</div>
                          <div className="text-xs text-muted-foreground">View students and organizations</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => navigate('/root/registrations')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-3 p-3">
                        <FileText className="h-6 w-6 text-orange-600" />
                        <div>
                          <div className="font-semibold">All Registrations</div>
                          <div className="text-xs text-muted-foreground">View all event registrations</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => navigate('/root/analytics')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-3 p-3">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                        <div>
                          <div className="font-semibold">Analytics</div>
                          <div className="text-xs text-muted-foreground">View analytics and reports</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => navigate('/root/monitor')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-3 p-3">
                        <Activity className="h-6 w-6 text-red-600" />
                        <div>
                          <div className="font-semibold">System Monitor</div>
                          <div className="text-xs text-muted-foreground">Monitor system activity</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => navigate('/root/trends')} className="cursor-pointer hover:shadow">
                      <CardContent className="flex items-center gap-3 p-3">
                        <TrendingUp className="h-6 w-6 text-indigo-600" />
                        <div>
                          <div className="font-semibold">Trends</div>
                          <div className="text-xs text-muted-foreground">View growth trends</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-8">
                    <Activity className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                    <div>Activity monitoring coming soon...</div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="transactions">
                <Card className="w-full max-w-5xl mx-auto">
                  <CardHeader>
                    <CardTitle>All Transactions (Root)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 relative max-w-xs">
                      <Input
                        type="text"
                        placeholder="Search transactions..."
                        value={txSearch}
                        onChange={e => setTxSearch(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {loadingTx ? (
                      <div className="text-blue-600">Loading transactions...</div>
                    ) : filteredTransactions.length === 0 ? (
                      <div className="text-muted-foreground">No transactions found.</div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border">
                        <Table className="min-w-full text-sm">
                          <TableHeader>
                            <TableRow className="bg-muted sticky top-0 z-10">
                              <TableHead className="whitespace-nowrap">Event ID</TableHead>
                              <TableHead className="whitespace-nowrap">Student Email</TableHead>
                              <TableHead className="whitespace-nowrap">Status</TableHead>
                              <TableHead className="whitespace-nowrap">Transaction ID</TableHead>
                              <TableHead className="whitespace-nowrap">Order ID</TableHead>
                              <TableHead className="whitespace-nowrap">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTransactions.map((tx, i) => (
                              <TableRow key={tx._id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50 hover:bg-muted'}>
                                <TableCell className="whitespace-nowrap font-mono">{tx.eventId}</TableCell>
                                <TableCell className="whitespace-nowrap">{tx.studentId}</TableCell>
                                <TableCell className="whitespace-nowrap font-semibold text-green-700">{tx.status}</TableCell>
                                <TableCell className="whitespace-nowrap font-mono">{tx.razorpay_payment_id || 'N/A'}</TableCell>
                                <TableCell className="whitespace-nowrap font-mono">{tx.razorpay_order_id || 'N/A'}</TableCell>
                                <TableCell className="whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="queries">
                <Card className="w-full max-w-5xl mx-auto">
                  <CardHeader>
                    <CardTitle>All Queries (Root)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 relative max-w-xs">
                      <Input
                        type="text"
                        placeholder="Search queries..."
                        value={querySearch}
                        onChange={e => setQuerySearch(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {loadingQueries ? (
                      <div className="text-blue-600">Loading queries...</div>
                    ) : filteredQueries.length === 0 ? (
                      <div className="text-muted-foreground">No queries found.</div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border">
                        <Table className="min-w-full text-sm">
                          <TableHeader>
                            <TableRow className="bg-muted sticky top-0 z-10">
                              <TableHead className="whitespace-nowrap">Event ID</TableHead>
                              <TableHead className="whitespace-nowrap">Event Name</TableHead>
                              <TableHead className="whitespace-nowrap">User Email</TableHead>
                              <TableHead className="whitespace-nowrap">User Name</TableHead>
                              <TableHead className="whitespace-nowrap">Message</TableHead>
                              <TableHead className="whitespace-nowrap">Resolution</TableHead>
                              <TableHead className="whitespace-nowrap">Date</TableHead>
                              <TableHead className="whitespace-nowrap">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredQueries.map((q, i) => (
                              <TableRow key={q._id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50 hover:bg-muted'}>
                                <TableCell className="whitespace-nowrap font-mono">{q.eventId}</TableCell>
                                <TableCell className="whitespace-nowrap">{q.eventName}</TableCell>
                                <TableCell className="whitespace-nowrap">{q.userEmail}</TableCell>
                                <TableCell className="whitespace-nowrap">{q.userName}</TableCell>
                                <TableCell className="max-w-xs truncate" title={q.message}>{q.message}</TableCell>
                                <TableCell className="max-w-xs truncate" title={q.resolution}>{q.resolution || '-'}</TableCell>
                                <TableCell className="whitespace-nowrap">{new Date(q.createdAt).toLocaleString()}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <div className="flex gap-1">
                                    <Button variant="outline" size="icon" onClick={() => handleEditQuery(q)} title="Edit Resolution"><Edit2 className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteQuery(q._id)} title="Delete Query"><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {/* Edit Resolution Modal */}
                    <Dialog open={!!editQuery} onOpenChange={v => { if (!v) setEditQuery(null); }}>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit Query Resolution</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4">
                          <div className="font-semibold mb-1">Query Message:</div>
                          <div className="bg-muted rounded p-2 text-sm mb-2">{editQuery?.message}</div>
                          <Textarea
                            value={editResolution}
                            onChange={e => setEditResolution(e.target.value)}
                            placeholder="Enter resolution..."
                            rows={4}
                            className="w-full"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditQuery(null)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                          <Button onClick={handleSaveResolution} disabled={editResolution.trim() === ''}><Save className="h-4 w-4 mr-1" /> Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      )}
    </ThemeProvider>
  );
}

export default RootDashboard; 