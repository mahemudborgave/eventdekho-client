import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  FileText,
  FileSpreadsheet,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  ShieldOff,
  UserX,
  UserCheck as UserCheckIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { ThemeProvider } from '../../components/ui/ThemeProvider';

function RootUsers() {
  const [users, setUsers] = useState({ students: [], organizations: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BASE_URL;
  const port = import.meta.env.VITE_PORT;

  useEffect(() => {
    checkAuthAndFetchUsers();
  }, []);

  const checkAuthAndFetchUsers = async () => {
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

      // Fetch users
      const response = await axios.get(`${baseURL}:${port}/root/users`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });

      setUsers(response.data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('rootToken');
        localStorage.removeItem('rootUser');
        toast.error('Session expired. Please login again.');
        navigate('/root/login');
      } else {
        toast.error('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, ' ');
  };

  const handleViewUser = async (userId) => {
    const rootToken = localStorage.getItem('rootToken');
    try {
      const response = await axios.get(`${baseURL}:${port}/root/users/${userId}`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      setSelectedUser(response.data);
      setShowUserModal(true);
    } catch (error) {
      toast.error('Failed to fetch user details');
    }
  };

  const handleEditUser = (user) => {
    setEditForm(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.put(`${baseURL}:${port}/root/users/${editForm._id}`, editForm, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      toast.success('User updated successfully');
      setShowEditModal(false);
      checkAuthAndFetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.delete(`${baseURL}:${port}/root/users/${userId}`, {
        headers: { Authorization: `Bearer ${rootToken}` }
      });
      toast.success('User deleted successfully');
      checkAuthAndFetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleVerification = async (userId, currentStatus) => {
    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.patch(`${baseURL}:${port}/root/users/${userId}/verify`, 
        { isVerified: !currentStatus },
        { headers: { Authorization: `Bearer ${rootToken}` } }
      );
      toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      checkAuthAndFetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const rootToken = localStorage.getItem('rootToken');
    try {
      await axios.patch(`${baseURL}:${port}/root/users/${userId}/status`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${rootToken}` } }
      );
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      checkAuthAndFetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    doc.text(`All ${activeTab === 'students' ? 'Students' : 'Organizations'} - Root Dashboard`, 14, 16);
    
    const data = activeTab === 'students' ? users.students : users.organizations;
    
    if (activeTab === 'students') {
      const tableColumn = [
        "#", "Student ID", "Name", "Email", "Gender", "College", "Course", "Branch", "Year", "Mobile", "Verified", "Active", "Created At"
      ];
      const tableRows = data.map((student, index) => [
        index + 1,
        student._id || '',
        student.name || '',
        student.email || '',
        student.gender || '',
        student.collegeName || '',
        student.course || '',
        student.branch || '',
        student.year || '',
        student.mobileNumber || '',
        student.isVerified ? 'Yes' : 'No',
        student.isActive !== false ? 'Yes' : 'No',
        formatDate(student.createdAt)
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto'
      });
    } else {
      const tableColumn = [
        "#", "Org ID", "Name", "Short Name", "Type", "Email", "Phone", "City", "Website", "Contact Person", "Verified", "Active", "Created At"
      ];
      const tableRows = data.map((org, index) => [
        index + 1,
        org._id || '',
        org.organizationName || '',
        org.shortName || '',
        org.organizationType || '',
        org.email || '',
        org.phone || '',
        org.city || '',
        org.website || '',
        org.contactPerson || '',
        org.isVerified ? 'Yes' : 'No',
        org.isActive !== false ? 'Yes' : 'No',
        formatDate(org.createdAt)
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto'
      });
    }

    doc.save(`${activeTab}_root_dashboard.pdf`);
  };

  const exportToExcel = () => {
    const data = activeTab === 'students' ? users.students : users.organizations;
    
    let worksheetData;
    if (activeTab === 'students') {
      worksheetData = data.map((student, index) => ({
        "#": index + 1,
        "Student ID": student._id || '',
        "Name": student.name || '',
        "Email": student.email || '',
        "Gender": student.gender || '',
        "College": student.collegeName || '',
        "Course": student.course || '',
        "Branch": student.branch || '',
        "Year": student.year || '',
        "Mobile": student.mobileNumber || '',
        "Verified": student.isVerified ? 'Yes' : 'No',
        "Active": student.isActive !== false ? 'Yes' : 'No',
        "Created At": formatDate(student.createdAt)
      }));
    } else {
      worksheetData = data.map((org, index) => ({
        "#": index + 1,
        "Org ID": org._id || '',
        "Name": org.organizationName || '',
        "Short Name": org.shortName || '',
        "Type": org.organizationType || '',
        "Email": org.email || '',
        "Phone": org.phone || '',
        "City": org.city || '',
        "Website": org.website || '',
        "Contact Person": org.contactPerson || '',
        "Verified": org.isVerified ? 'Yes' : 'No',
        "Active": org.isActive !== false ? 'Yes' : 'No',
        "Created At": formatDate(org.createdAt)
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'students' ? 'Students' : 'Organizations');
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${activeTab}_root_dashboard.xlsx`);
  };

  const filteredStudents = users.students?.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.collegeName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredOrganizations = users.organizations?.filter(org =>
    org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.city?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const currentData = activeTab === 'students' ? filteredStudents : filteredOrganizations;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {/* Header */}
      <header className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-2 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/root/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Users className="h-6 w-6 text-green-600" />
            </span>
            <div>
              <h1 className="text-lg font-bold">User Management</h1>
              <p className="text-xs text-muted-foreground">Manage students and organizations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-1">
              <FileText className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-1">
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-2 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-xs text-muted-foreground">Total Students</div>
                <div className="text-lg font-bold text-green-600">{users.totalStudents || 0}</div>
              </div>
              <Users className="h-6 w-6 text-green-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-xs text-muted-foreground">Total Organizations</div>
                <div className="text-lg font-bold text-purple-600">{users.totalOrganizations || 0}</div>
              </div>
              <UserCheck className="h-6 w-6 text-purple-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-xs text-muted-foreground">Verified Users</div>
                <div className="text-lg font-bold text-blue-600">{(users.students?.filter(s => s.isVerified).length || 0) + (users.organizations?.filter(o => o.isVerified).length || 0)}</div>
              </div>
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-xs text-muted-foreground">Active Users</div>
                <div className="text-lg font-bold text-orange-600">{(users.students?.filter(s => s.isActive !== false).length || 0) + (users.organizations?.filter(o => o.isActive !== false).length || 0)}</div>
              </div>
              <UserCheckIcon className="h-6 w-6 text-orange-600" />
            </CardContent>
          </Card>
        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full flex gap-2">
            <TabsTrigger value="students">Students ({users.totalStudents || 0})</TabsTrigger>
            <TabsTrigger value="organizations">Organizations ({users.totalOrganizations || 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="students">
            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-md">
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-lg border">
                  <Table className="min-w-full text-sm">
                    <TableHeader>
                      <TableRow className="bg-muted sticky top-0 z-10">
                        <TableHead className="whitespace-nowrap">User</TableHead>
                        <TableHead className="whitespace-nowrap">Contact</TableHead>
                        <TableHead className="whitespace-nowrap">Details</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((user, i) => (
                        <TableRow key={user._id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50 hover:bg-muted'}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs font-medium text-foreground">
                                  {user.name?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-xs">
                              <div><span className="font-semibold">Email:</span> {user.email}</div>
                              {user.mobileNumber && <div><span className="font-semibold">Mobile:</span> {user.mobileNumber}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-xs">
                              {user.collegeName && <div><span className="font-semibold">College:</span> {user.collegeName}</div>}
                              {user.course && <div><span className="font-semibold">Course:</span> {user.course}</div>}
                              {user.branch && <div><span className="font-semibold">Branch:</span> {user.branch}</div>}
                              {user.year && <div><span className="font-semibold">Year:</span> {user.year}</div>}
                              {user.semester && <div><span className="font-semibold">Semester:</span> {user.semester}</div>}
                              {user.gender && <div><span className="font-semibold">Gender:</span> {user.gender}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`text-xs font-semibold ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>{user.isVerified ? 'Verified' : 'Unverified'}</span>
                              <span className={`text-xs font-semibold ${user.isActive !== false ? 'text-blue-600' : 'text-gray-400'}`}>{user.isActive !== false ? 'Active' : 'Inactive'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex gap-1">
                              <Button variant="outline" size="icon" onClick={() => handleViewUser(user._id)} title="View"><Eye className="h-4 w-4" /></Button>
                              <Button variant="outline" size="icon" onClick={() => handleEditUser(user)} title="Edit"><Edit className="h-4 w-4" /></Button>
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user._id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="organizations">
            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-md">
                <Input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-lg border">
                  <Table className="min-w-full text-sm">
                    <TableHeader>
                      <TableRow className="bg-muted sticky top-0 z-10">
                        <TableHead className="whitespace-nowrap">User</TableHead>
                        <TableHead className="whitespace-nowrap">Contact</TableHead>
                        <TableHead className="whitespace-nowrap">Details</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrganizations.map((user, i) => (
                        <TableRow key={user._id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50 hover:bg-muted'}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs font-medium text-foreground">
                                  {user.organizationName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium">{user.organizationName}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm">{user.phone}</div>
                            {user.website && <div className="text-xs text-muted-foreground">{user.website}</div>}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-xs">
                              {user.city && <div>{user.city}</div>}
                              {user.organizationType && <div>{user.organizationType}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`text-xs font-semibold ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>{user.isVerified ? 'Verified' : 'Unverified'}</span>
                              <span className={`text-xs font-semibold ${user.isActive !== false ? 'text-blue-600' : 'text-gray-400'}`}>{user.isActive !== false ? 'Active' : 'Inactive'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex gap-1">
                              <Button variant="outline" size="icon" onClick={() => handleViewUser(user._id)} title="View"><Eye className="h-4 w-4" /></Button>
                              <Button variant="outline" size="icon" onClick={() => handleEditUser(user)} title="Edit"><Edit className="h-4 w-4" /></Button>
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user._id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Details Modal */}
      <Dialog open={showUserModal && !!selectedUser} onOpenChange={v => { if (!v) setShowUserModal(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold">Name:</div>
                  <div>{selectedUser.userType === 'student' ? selectedUser.user.name : selectedUser.user.organizationName}</div>
                </div>
                <div>
                  <div className="font-semibold">Email:</div>
                  <div>{selectedUser.user.email}</div>
                </div>
                {selectedUser.userType === 'student' ? (
                  <>
                    <div><span className="font-semibold">Name:</span> {selectedUser.user.name}</div>
                    <div><span className="font-semibold">Email:</span> {selectedUser.user.email}</div>
                    <div><span className="font-semibold">Mobile:</span> {selectedUser.user.mobileNumber || '-'}</div>
                    <div><span className="font-semibold">College:</span> {selectedUser.user.collegeName || '-'}</div>
                    <div><span className="font-semibold">Course:</span> {selectedUser.user.course || '-'}</div>
                    <div><span className="font-semibold">Branch:</span> {selectedUser.user.branch || '-'}</div>
                    <div><span className="font-semibold">Year:</span> {selectedUser.user.year || '-'}</div>
                    <div><span className="font-semibold">Semester:</span> {selectedUser.user.semester || '-'}</div>
                    <div><span className="font-semibold">Gender:</span> {selectedUser.user.gender || '-'}</div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="font-semibold">Short Name:</div>
                      <div>{selectedUser.user.shortName || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Type:</div>
                      <div>{selectedUser.user.organizationType || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">City:</div>
                      <div>{selectedUser.user.city || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Phone:</div>
                      <div>{selectedUser.user.phone || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Website:</div>
                      <div>{selectedUser.user.website || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Contact Person:</div>
                      <div>{selectedUser.user.contactPerson || '-'}</div>
                    </div>
                  </>
                )}
                <div>
                  <div className="font-semibold">Created:</div>
                  <div>{formatDate(selectedUser.user.createdAt)}</div>
                </div>
                <div>
                  <div className="font-semibold">Status:</div>
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{selectedUser.user.isVerified ? 'Verified' : 'Unverified'}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.user.isActive !== false ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{selectedUser.user.isActive !== false ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>Close</Button>
            <Button variant="default" onClick={() => { setEditForm(selectedUser.user); setShowEditModal(true); setShowUserModal(false); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={v => {
        if (!v) {
          setShowEditModal(false);
          setEditForm({}); // Reset form state on close
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleUpdateUser(); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={editForm.name || editForm.organizationName || ''}
                  onChange={e => setEditForm({ ...editForm, [activeTab === 'students' ? 'name' : 'organizationName']: e.target.value })}
                  className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                />
              </div>
              {activeTab === 'students' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium">Mobile</label>
                    <input
                      type="text"
                      value={editForm.mobileNumber || ''}
                      onChange={e => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">College</label>
                    <input
                      type="text"
                      value={editForm.collegeName || ''}
                      onChange={e => setEditForm({ ...editForm, collegeName: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Course</label>
                    <input
                      type="text"
                      value={editForm.course || ''}
                      onChange={e => setEditForm({ ...editForm, course: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Branch</label>
                    <input
                      type="text"
                      value={editForm.branch || ''}
                      onChange={e => setEditForm({ ...editForm, branch: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Year</label>
                    <input
                      type="text"
                      value={editForm.year || ''}
                      onChange={e => setEditForm({ ...editForm, year: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium">Short Name</label>
                    <input
                      type="text"
                      value={editForm.shortName || ''}
                      onChange={e => setEditForm({ ...editForm, shortName: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Type</label>
                    <input
                      type="text"
                      value={editForm.organizationType || ''}
                      onChange={e => setEditForm({ ...editForm, organizationType: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">City</label>
                    <input
                      type="text"
                      value={editForm.city || ''}
                      onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Website</label>
                    <input
                      type="text"
                      value={editForm.website || ''}
                      onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Contact Person</label>
                    <input
                      type="text"
                      value={editForm.contactPerson || ''}
                      onChange={e => setEditForm({ ...editForm, contactPerson: e.target.value })}
                      className="mt-1 block w-full border border-muted rounded-md px-3 py-2 bg-background text-foreground"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditForm({}); }}>Cancel</Button>
              <Button type="submit" variant="default">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default RootUsers;