import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    IconButton,
    Collapse,
    styled
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { toast } from 'react-toastify';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';

const MainContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    minHeight: '100vh',
    paddingTop: '90px',
    paddingLeft: '100px',
    padding: theme.spacing(4),
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
    maxWidth: '1200px',
    margin: '0 auto',
    padding: theme.spacing(0, 2),
}));

const StyledTableContainer = styled(TableContainer)({
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
});

const StyledTableCell = styled(TableCell)({
    fontFamily: 'Inter, sans-serif',
    '&.MuiTableCell-head': {
        backgroundColor: 'rgba(0,0,0,0.02)',
        fontWeight: 600,
    },
});

const StatusDialog = ({ open, onClose, order, onStatusUpdate }) => {
    const [status, setStatus] = useState(order?.status || 'pending');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onStatusUpdate(order._id, status, note);
            onClose();
            // Reset form
            setNote('');
        } catch (error) {
            console.error('Status update error:', error);
            toast.error(error.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    minWidth: '400px',
                }
            }}
        >
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogContent>
                <Box sx={{ my: 2 }}>
                    <TextField
                        select
                        fullWidth
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        margin="normal"
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        label="Note"
                        multiline
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        margin="normal"
                        placeholder="Add a note about this status change..."
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update Status'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const OrderRow = ({ order, onStatusUpdate }) => {
    const [open, setOpen] = useState(false);
    const [openStatusDialog, setOpenStatusDialog] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'confirmed':
                return 'info';
            case 'shipped':
                return 'primary';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <TableRow>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{order._id}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                    <Chip
                        label={order.status?.toUpperCase()}
                        color={getStatusColor(order.status)}
                        size="small"
                    />
                </TableCell>
                <TableCell>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setOpenStatusDialog(true)}
                    >
                        Update Status
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Box sx={{ margin: 1 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    Order Details
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Book</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.orderItems.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.bookId.title}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>€{item.bookId.price.toFixed(2)}</TableCell>
                                                <TableCell>€{(item.bookId.price * item.quantity).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} align="right"><strong>Total Amount:</strong></TableCell>
                                            <TableCell>
                                                <strong>
                                                    €{order.orderItems.reduce((sum, item) => 
                                                        sum + (item.bookId.price * item.quantity), 0).toFixed(2)}
                                                </strong>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                {order.statusHistory && order.statusHistory.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Status History
                                        </Typography>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Note</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {order.statusHistory.map((history, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Chip
                                                                label={history.status.toUpperCase()}
                                                                color={getStatusColor(history.status)}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>{formatDate(history.date)}</TableCell>
                                                        <TableCell>{history.note}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
                            </Box>
                        </Collapse>
                    </Box>
                </TableCell>
            </TableRow>
            <StatusDialog
                open={openStatusDialog}
                onClose={() => setOpenStatusDialog(false)}
                order={order}
                onStatusUpdate={onStatusUpdate}
            />
        </>
    );
};

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAllOrders();
            setOrders(response.data || []);
            setError(null);
        } catch (err) {
            const errorMsg = err.message || 'Failed to load orders';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus, note) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus, note);
            toast.success('Order status updated successfully');
            await loadOrders(); // Refresh orders list
        } catch (error) {
            toast.error(error.message || 'Failed to update order status');
            throw error; // Propagate error to the dialog
        }
    };

    if (loading) {
        return (
            <MainContainer>
                <ContentWrapper>
                    <LoadingSpinner />
                </ContentWrapper>
            </MainContainer>
        );
    }

    if (error) {
        return (
            <MainContainer>
                <ContentWrapper>
                    <Typography color="error" variant="h6">{error}</Typography>
                </ContentWrapper>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            <ContentWrapper>
                <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Playfair Display' }}>
                    Manage Orders
                </Typography>

                <StyledTableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell />
                                <StyledTableCell>Order ID</StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <OrderRow 
                                    key={order._id} 
                                    order={order}
                                    onStatusUpdate={handleStatusUpdate}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </ContentWrapper>
        </MainContainer>
    );
};

export default ManageOrders;
