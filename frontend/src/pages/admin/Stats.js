import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress
} from '@mui/material';
import {
    Book as BookIcon,
    People as PeopleIcon,
    ShoppingCart as OrderIcon,
    Assignment as RentalIcon
} from '@mui/icons-material';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const StatCard = ({ title, value, icon, color }) => (
    <Card>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                    backgroundColor: `${color}.light`,
                    borderRadius: '50%',
                    p: 1,
                    mr: 2
                }}>
                    {icon}
                </Box>
                <Typography color="textSecondary" variant="h6">
                    {title}
                </Typography>
            </Box>
            <Typography variant="h4" component="div">
                {value}
            </Typography>
        </CardContent>
    </Card>
);

const Stats = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRentals: 0,
        recentActivity: {
            newUsers: 0,
            newOrders: 0,
            activeRentals: 0,
            overdueRentals: 0
        },
        popular: {
            books: [],
            categories: []
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Update API endpoints to match backend routes
            const [books, users, orders, rentals] = await Promise.all([
                API.get('/books/admin'),
                API.get('/admin/users'),
                API.get('/orders'),
                API.get('/rentals')
            ]);

            // Calculate statistics from the raw data
            const activeRentals = rentals.data.filter(r => !r.returned).length;
            const overdueRentals = rentals.data.filter(r => 
                !r.returned && new Date(r.dueDate) < new Date()
            ).length;

            setStats({
                totalBooks: books.data.length,
                totalUsers: users.data.length,
                totalOrders: orders.data.length,
                totalRentals: rentals.data.length,
                recentActivity: {
                    newUsers: users.data.filter(u => 
                        new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length,
                    newOrders: orders.data.filter(o => 
                        new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length,
                    activeRentals,
                    overdueRentals
                },
                popular: {
                    books: calculatePopularBooks(orders.data),
                    categories: calculatePopularCategories(books.data)
                }
            });
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePopularBooks = (orders) => {
        const bookCounts = {};
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                const bookId = item.bookId._id;
                bookCounts[bookId] = (bookCounts[bookId] || 0) + item.quantity;
            });
        });

        return Object.entries(bookCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([bookId, count]) => ({
                book: orders.find(o => 
                    o.orderItems.some(i => i.bookId._id === bookId)
                ).orderItems.find(i => i.bookId._id === bookId).bookId,
                count
            }));
    };

    const calculatePopularCategories = (books) => {
        const categoryCounts = {};
        books.forEach(book => {
            const categoryId = book.category._id;
            categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
        });

        return Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([categoryId, count]) => ({
                category: books.find(b => b.category._id === categoryId).category,
                count
            }));
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Main Statistics */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Books"
                        value={stats.totalBooks}
                        icon={<BookIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<PeopleIcon />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        icon={<OrderIcon />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Rentals"
                        value={stats.totalRentals}
                        icon={<RentalIcon />}
                        color="error"
                    />
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activity (Last 30 Days)
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                New Users
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={(stats.recentActivity.newUsers / stats.totalUsers) * 100}
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="body2" gutterBottom>
                                New Orders
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={(stats.recentActivity.newOrders / stats.totalOrders) * 100}
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="body2" gutterBottom>
                                Active Rentals
                            </Typography>
                            <LinearProgress 
                                variant="determinate"
                                value={(stats.recentActivity.activeRentals / stats.totalRentals) * 100}
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="body2" gutterBottom>
                                Overdue Rentals
                            </Typography>
                            <LinearProgress 
                                variant="determinate"
                                value={(stats.recentActivity.overdueRentals / stats.totalRentals) * 100}
                                color="error"
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Popular Books */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Most Popular Books
                        </Typography>
                        {stats.popular.books.map(({ book, count }) => (
                            <Box key={book._id} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">{book.title}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {count} orders
                                    </Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate"
                                    value={(count / Math.max(...stats.popular.books.map(b => b.count))) * 100}
                                />
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* Popular Categories */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Popular Categories
                        </Typography>
                        <Grid container spacing={2}>
                            {stats.popular.categories.map(({ category, count }) => (
                                <Grid item xs={12} sm={6} md={4} key={category._id}>
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">{category.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {count} books
                                            </Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate"
                                            value={(count / Math.max(...stats.popular.categories.map(c => c.count))) * 100}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Stats;