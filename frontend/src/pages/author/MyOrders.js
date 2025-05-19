import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Container,
    styled,
    Button,
    Paper,
} from '@mui/material';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';

const MainContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    minHeight: '100vh',
    paddingTop: '90px',
    paddingLeft: '100px',
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
    padding: theme.spacing(4),
}));

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getMyOrders();
            setOrders(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to fetch orders. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'pending': 'warning',
            'processing': 'info',
            'completed': 'success',
            'cancelled': 'error'
        };
        return statusColors[status.toLowerCase()] || 'default';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    return (
        <MainContainer>
            <ContentWrapper>
                <Typography variant="h4" gutterBottom sx={{ mb: 4, fontFamily: 'Playfair Display' }}>
                    My Orders
                </Typography>

                {error ? (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            backgroundColor: 'rgba(211, 47, 47, 0.1)' 
                        }}
                        action={
                            <Button 
                                color="inherit" 
                                size="small"
                                onClick={fetchOrders}
                            >
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                ) : null}

                {orders.length === 0 ? (
                    <Paper 
                        sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No orders found
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            You haven't placed any orders yet.
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {orders.map((order) => (
                            <Grid item xs={12} key={order._id}>
                                <Card 
                                    sx={{ 
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.3s ease'
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="flex-start">
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="h6" component="div" gutterBottom>
                                                    Order #{order._id.slice(-6)}
                                                </Typography>
                                                <Typography color="text.secondary" gutterBottom>
                                                    Placed on: {formatDate(order.createdAt)}
                                                </Typography>
                                                {order.orderItems.map((item, index) => (
                                                    <Box key={index} sx={{ mt: index > 0 ? 2 : 0 }}>
                                                        <Box sx={{ display: 'flex', mb: 1 }}>
                                                            <Box 
                                                                component="img"
                                                                src={item.bookId?.poster || '/default-book.jpg'}
                                                                alt={item.bookId?.title}
                                                                sx={{ 
                                                                    width: 60, 
                                                                    height: 80, 
                                                                    objectFit: 'cover',
                                                                    borderRadius: 1,
                                                                    mr: 2
                                                                }}
                                                            />
                                                            <Box>
                                                                <Typography variant="subtitle1">
                                                                    {item.bookId?.title || 'Unknown Book'}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    by {item.bookId?.author?.name || 'Unknown Author'}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Quantity: {item.quantity}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Grid>
                                            <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Box>
                                                    <Chip 
                                                        label={order.status}
                                                        color={getStatusColor(order.status)}
                                                        sx={{ mb: 1 }}
                                                    />
                                                    <Typography variant="h6" color="primary" align="right">
                                                        ${order.totalAmount?.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </ContentWrapper>
        </MainContainer>
    );
};

export default MyOrders;
