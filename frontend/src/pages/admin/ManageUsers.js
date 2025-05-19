import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        lastname: '',
        mail: '',
        role: '',
        isActive: true
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await API.get('/admin/users');  // Updated endpoint
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            lastname: user.lastname,
            mail: user.email || user.mail,  // Handle both email and mail fields
            role: user.role,
            isActive: user.isActive
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setEditForm({
            name: '',
            lastname: '',
            mail: '',
            role: '',
            isActive: true
        });
    };

    const handleUpdateUser = async () => {
        try {
            await API.put(`/admin/user/${selectedUser._id}`, editForm);  // Updated endpoint
            toast.success('User updated successfully');
            loadUsers();
            handleCloseDialog();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await API.delete(`/admin/user/${userId}`);  // Updated endpoint
                toast.success('User deleted successfully');
                loadUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: name === "isActive" ? (value === "true" || value === true) : value
        }));
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Box sx={{ bgcolor: '#f6f8fa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                    Manage Users
                </Typography>

                <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(60,60,60,0.07)' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: '#f3f5f7' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>
                                            {user.name} {user.lastname}
                                        </TableCell>
                                        <TableCell>{user.mail}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                color={
                                                    user.role === 'admin' ? 'error' :
                                                    user.role === 'author' ? 'primary' : 
                                                    'default'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.isActive ? 'Active' : 'Inactive'}
                                                color={user.isActive ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>Edit User</DialogTitle>
                    <DialogContent>
                        <Box component="form" sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="name"
                                label="First Name"
                                value={editForm.name}
                                onChange={handleInputChange}
                                sx={{ borderRadius: 2 }}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                name="lastname"
                                label="Last Name"
                                value={editForm.lastname}
                                onChange={handleInputChange}
                                sx={{ borderRadius: 2 }}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                name="mail"
                                label="Email"
                                value={editForm.mail}
                                onChange={handleInputChange}
                                sx={{ borderRadius: 2 }}
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={editForm.role}
                                    label="Role"
                                    onChange={handleInputChange}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="author">Author</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="isActive"
                                    value={editForm.isActive}
                                    label="Status"
                                    onChange={handleInputChange}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value={true}>Active</MenuItem>
                                    <MenuItem value={false}>Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleUpdateUser} variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600 }}>
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ManageUsers;
