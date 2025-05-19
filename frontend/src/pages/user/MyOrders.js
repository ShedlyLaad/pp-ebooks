import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Box,
    styled,
} from '@mui/material';
import { ShoppingBag as ShoppingBagIcon, LocalShipping, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';

const MainContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    minHeight: '100vh',
    paddingTop: '90px', // Account for the top bar
    paddingLeft: '100px', // Account for the sidebar
    padding: theme.spacing(4),
}));

const HeadingText = styled(Typography)({
    fontFamily: 'Playfair Display, serif',
    color: '#2A2A2A',
    marginBottom: '2rem',
});

const StyledPaper = styled(Paper)({
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
});

const StyledTableCell = styled(TableCell)({
    fontFamily: 'Inter, sans-serif',
    borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
    '&.MuiTableCell-head': {
        backgroundColor: 'rgba(0,0,0,0.02)',
        fontWeight: 600,
    },
});

const OrderDetails = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: 'rgba(0,0,0,0.01)',
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const OrderItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: theme.spacing(1),
    '&:last-child': {
        marginBottom: 0,
    },
}));

const StatusTracker = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: theme.spacing(2, 0),
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        height: '2px',
        backgroundColor: theme.palette.divider,
        zIndex: 0,
    },
}));

const StatusStep = styled(Box)(({ theme, active }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    opacity: active ? 1 : 0.5,
}));

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderService.getMyOrders();
            console.log('Orders response:', response);
            
            let ordersData = [];
            if (response?.success && Array.isArray(response.data)) {
                ordersData = response.data;
            } else if (response?.data?.data && Array.isArray(response.data.data)) {
                ordersData = response.data.data;
            } else {
                throw new Error('Invalid data structure received');
            }

            // Sort orders by date
            ordersData.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });

            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading orders:', error);
            const errorMessage = error.message || 'Failed to load orders';
            setError(errorMessage);
            toast.error(errorMessage);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [sortOrder]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { color: 'warning', icon: ShoppingBagIcon, text: 'Order Placed' },
            confirmed: { color: 'info', icon: CheckCircle, text: 'Order Confirmed' },
            shipped: { color: 'primary', icon: LocalShipping, text: 'Order Shipped' },
            delivered: { color: 'success', icon: CheckCircle, text: 'Order Delivered' },
        };
        return statusMap[status?.toLowerCase()] || { color: 'default', icon: ShoppingBagIcon, text: 'Unknown' };
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    };

    const calculateTotal = (orderItems) => {
        if (!Array.isArray(orderItems)) return '0.00';
        return orderItems.reduce((total, item) => {
            const price = parseFloat(item?.bookId?.price) || 0;
            const quantity = parseInt(item?.quantity) || 0;
            return total + (price * quantity);
        }, 0).toFixed(2);
    };

    if (loading) {
        return (
            <MainContainer>
                <LoadingSpinner />
            </MainContainer>
        );
    }

    if (error) {
        return (
            <MainContainer>
                <HeadingText variant="h4">My Orders</HeadingText>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={loadOrders}
                    sx={{ mt: 2 }}
                >
                    Retry Loading
                </Button>
            </MainContainer>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <MainContainer>
                <HeadingText variant="h4">My Orders</HeadingText>
                <StyledPaper sx={{ p: 4, textAlign: 'center' }}>
                    <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Orders Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You haven't placed any orders yet.
                    </Typography>
                </StyledPaper>
            </MainContainer>
        );
    }    return (
        <MainContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <HeadingText variant="h4">My Orders History</HeadingText>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    }}
                >
                    Sort by Date {sortOrder === 'desc' ? '↓' : '↑'}
                </Button>
            </Box>
            <StyledPaper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Order ID</StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell>Items</StyledTableCell>
                                <StyledTableCell>Total</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <>
                                    <TableRow key={order?._id}>
                                        <StyledTableCell>{order?._id}</StyledTableCell>
                                        <StyledTableCell>{formatDate(order?._createdAt)}</StyledTableCell>
                                        <StyledTableCell>
                                            {order?.orderItems?.length || 0} items
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            ${calculateTotal(order?.orderItems)}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Chip
                                                label={order?.status || 'unknown'}
                                                color={getStatusInfo(order?.status).color}
                                                size="small"
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Button
                                                size="small"
                                                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                            >
                                                {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                                            </Button>
                                        </StyledTableCell>
                                    </TableRow>
                                    {expandedOrder === order._id && (
                                        <TableRow>
                                            <StyledTableCell colSpan={6}>
                                                <OrderDetails>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Order Details:
                                                    </Typography>
                                                    {order?.orderItems?.map((item, index) => (
                                                        <OrderItem key={index}>
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {item?.bookId?.title || 'Unknown Book'}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    By {item?.bookId?.author || 'Unknown Author'}
                                                                </Typography>
                                                            </Box>
                                                            <Box textAlign="right">
                                                                <Typography variant="body2">
                                                                    ${item?.bookId?.price || '0.00'} x {item?.quantity || 0}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    Subtotal: ${((item?.bookId?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                                                                </Typography>
                                                            </Box>
                                                        </OrderItem>
                                                    ))}
                                                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                                                        <Typography variant="subtitle2">
                                                            Total Amount: ${calculateTotal(order?.orderItems)}
                                                        </Typography>
                                                    </Box>
                                                </OrderDetails>
                                            </StyledTableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </MainContainer>
    );
};

export default MyOrders;