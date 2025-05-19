import { Box, Grid, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    LibraryBooks,
    People,
    ShoppingCart,
    Book,
    BarChart
} from '@mui/icons-material';

const AdminCard = ({ title, icon: Icon, path, count }) => {
    const navigate = useNavigate();
    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(60,60,60,0.07)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                    boxShadow: '0 4px 24px rgba(60,60,60,0.13)',
                    transform: 'translateY(-4px) scale(1.03)',
                    backgroundColor: 'rgba(0, 184, 217, 0.07)'
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
            }}
            onClick={() => navigate(path)}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Icon sx={{ fontSize: 44, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
            </Box>
            {count !== undefined && (
                <Typography variant="h4" color="primary">
                    {count}
                </Typography>
            )}
        </Paper>
    );
};

const HomeAdmin = () => {
    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f6f8fa', minHeight: '100vh' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                Admin Dashboard
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <AdminCard
                        title="Manage Books"
                        icon={LibraryBooks}
                        path="/admin/books"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <AdminCard
                        title="Manage Users"
                        icon={People}
                        path="/admin/users"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <AdminCard
                        title="Manage Orders"
                        icon={ShoppingCart}
                        path="/admin/orders"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <AdminCard
                        title="Manage Rentals"
                        icon={Book}
                        path="/admin/rentals"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <AdminCard
                        title="Statistics"
                        icon={BarChart}
                        path="/admin/stats"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomeAdmin;
