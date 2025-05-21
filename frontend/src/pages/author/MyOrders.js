import React, { useState, useEffect, useCallback } from 'react';
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
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Collapse,
    TableSortLabel,
    styled
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { orderService } from '../../services/orderService';

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

const calculateTotalAmount = (items) => {
    return items?.reduce((sum, item) => {
        const price = item?.book?.price || item?.bookId?.price || 0;
        const quantity = item?.quantity || 1;
        return sum + (price * quantity);
    }, 0) || 0;
};

const OrderRow = ({ order }) => {
    const [open, setOpen] = useState(false);

    const getStatusColor = (status) => {
        const normalizedStatus = status?.toUpperCase();
        switch (normalizedStatus) {
            case 'PENDING':
                return 'warning';
            case 'CONFIRMED':
                return 'info';
            case 'COMPLETED':
            case 'DELIVERED':
                return 'success';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined) return '€0.00';
        try {
            return `€${Number(price).toFixed(2)}`;
        } catch (error) {
            console.error('Error formatting price:', error);
            return '€0.00';
        }
    };

    console.log('Order data:', order); // For debugging

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <StyledTableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell>{order?._id || order?.orderId || 'N/A'}</StyledTableCell>
                <StyledTableCell>{formatDate(order?.createdAt || order?.orderDate)}</StyledTableCell>
                <StyledTableCell>
                    <Chip
                        label={order?.status || 'PENDING'}
                        color={getStatusColor(order?.status)}
                        size="small"
                    />
                </StyledTableCell>
                <StyledTableCell>{formatPrice(order?.totalAmount)}</StyledTableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <OrderDetails>
                            <Typography variant="h6" gutterBottom>
                                Order Details
                            </Typography>
                            <StatusTracker>
                                {['PENDING', 'CONFIRMED', 'COMPLETED'].map((step) => (
                                    <StatusStep key={step} active={order.status === step}>
                                        <Chip
                                            label={step}
                                            color={order.status === step ? getStatusColor(step) : 'default'}
                                            size="small"
                                        />
                                    </StatusStep>
                                ))}
                            </StatusTracker>                            {(order?.books || order?.items || []).map((item, index) => (
                                <OrderItem key={index}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="subtitle1">
                                            {item?.title || item?.book?.title || 'Unknown Title'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            by {item?.author || item?.book?.author || 'Unknown Author'}
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle2">
                                        {formatPrice(item?.price || item?.book?.price)}
                                    </Typography>
                                </OrderItem>
                            ))}
                        </OrderDetails>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderBy, setOrderBy] = useState('orderDate');
    const [order, setOrder] = useState('desc');

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await orderService.getMyOrders();
            console.log('Orders response:', response);
            const ordersData = response.data || response;
            const formattedOrders = (Array.isArray(ordersData) ? ordersData : []).map(order => ({
                ...order,
                items: order.orderItems.map(item => ({
                    ...item,
                    book: item.bookId,
                    price: item.bookId.price * (item.quantity || 1)
                })),
                totalAmount: order.orderItems.reduce((sum, item) => 
                    sum + (item.bookId.price * (item.quantity || 1)), 0)
            }));
            setOrders(formattedOrders);
            setError(null);
        } catch (err) {
            setError('Failed to fetch orders. Please try again later.');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const sortedOrders = [...orders].sort((a, b) => {
        if (orderBy === 'orderDate') {
            return order === 'asc'
                ? new Date(a.orderDate) - new Date(b.orderDate)
                : new Date(b.orderDate) - new Date(a.orderDate);
        }
        if (orderBy === 'totalAmount') {
            return order === 'asc'
                ? a.totalAmount - b.totalAmount
                : b.totalAmount - a.totalAmount;
        }
        return 0;
    });

    if (loading) {
        return (
            <MainContainer>
                <ContentWrapper>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress />
                    </Box>
                </ContentWrapper>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            <ContentWrapper>
                <HeadingText variant="h4" gutterBottom>
                    My Orders
                </HeadingText>

                {error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                ) : orders.length === 0 ? (
                    <StyledPaper>
                        <OrderDetails>
                            <Typography variant="h6" color="text.secondary" align="center">
                                You haven't placed any orders yet.
                            </Typography>
                        </OrderDetails>
                    </StyledPaper>
                ) : (
                    <StyledPaper>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell />
                                        <StyledTableCell>Order ID</StyledTableCell>
                                        <StyledTableCell>
                                            <TableSortLabel
                                                active={orderBy === 'orderDate'}
                                                direction={orderBy === 'orderDate' ? order : 'asc'}
                                                onClick={() => handleSort('orderDate')}
                                            >
                                                Date
                                            </TableSortLabel>
                                        </StyledTableCell>
                                        <StyledTableCell>Status</StyledTableCell>
                                        <StyledTableCell>
                                            <TableSortLabel
                                                active={orderBy === 'totalAmount'}
                                                direction={orderBy === 'totalAmount' ? order : 'asc'}
                                                onClick={() => handleSort('totalAmount')}
                                            >
                                                Total
                                            </TableSortLabel>
                                        </StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedOrders.map((order) => (
                                        <OrderRow key={order.orderId} order={order} />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </StyledPaper>
                )}
            </ContentWrapper>
        </MainContainer>
    );
};

export default MyOrders;
