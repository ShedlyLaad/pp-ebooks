import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    Chip,
    Select,
    MenuItem,
    FormControl
} from '@mui/material';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAllOrders();
            console.log('Orders response in component:', response); // For debugging
            
            // Check if we have the data in the correct structure
            if (response?.success && Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('Invalid orders data structure:', response);
                setOrders([]);
                throw new Error('Invalid data received from server');
            }
            setError(null);
        } catch (error) {
            console.error('Error loading orders:', error);
            setError(error.message || 'Failed to load orders');
            toast.error('Failed to load orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };const handleStatusChange = async (orderId, newStatus) => {
        if (!orderId) {
            toast.error('Invalid order ID');
            return;
        }

        try {
            setLoading(true);
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            await loadOrders(); // Refresh the list
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error(error.message || 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'confirmed':
                return 'info';
            case 'shipped':
                return 'primary';
            case 'delivered':
                return 'success';
            default:
                return 'default';
        }
    };    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const calculateTotal = (orderItems) => {
        if (!Array.isArray(orderItems)) return '0.00';
        try {
            return orderItems.reduce((total, item) => {
                const price = parseFloat(item?.bookId?.price) || 0;
                const quantity = parseInt(item?.quantity) || 0;
                return total + (price * quantity);
            }, 0).toFixed(2);
        } catch (error) {
            console.error('Error calculating total:', error);
            return '0.00';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
            </Container>
        );
    }    if (!orders || orders.length === 0) {
        return (
            <Container>
                <Typography variant="h4" gutterBottom>
                    Manage Orders
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    No orders found.
                </Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Manage Orders
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders?.map((order) => (
                            <TableRow key={order?._id || Math.random()}>
                                <TableCell>{order?._id}</TableCell>
                                <TableCell>{order?.userId?.name || 'N/A'}</TableCell>
                                <TableCell>{formatDate(order?.createdAt)}</TableCell>
                                <TableCell>
                                    {order?.orderItems?.map((item, index) => (
                                        <Box key={index}>
                                            {item?.bookId?.title || 'Unknown Book'} (x{item?.quantity || 0})
                                        </Box>
                                    )) || 'No items'}
                                </TableCell>
                                <TableCell>${calculateTotal(order?.orderItems || [])}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order?.status || 'unknown'}
                                        color={getStatusColor(order?.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControl size="small">
                                        <Select
                                            value={order?.status || 'pending'}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            size="small"
                                        >
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="confirmed">Confirmed</MenuItem>
                                            <MenuItem value="shipped">Shipped</MenuItem>
                                            <MenuItem value="delivered">Delivered</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ManageOrders;
