import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Material-UI Components
import {
    Box,
    Typography,
    Avatar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    styled,
    Menu,
    MenuItem,
    Divider,
    useTheme,
} from '@mui/material';

// Material-UI Icons
import {
    Home as HomeIcon,
    Book as RentalIcon,
    ShoppingCart as OrderIcon,
    Info as InfoIcon,
    LibraryBooks as LibraryIcon,
    SupervisorAccount as UsersIcon,
    Assessment as StatsIcon,
    Add as AddIcon,
    Person as PersonIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 80;

const Sidebar = styled(Drawer)(({ theme }) => ({
    width: DRAWER_WIDTH,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: DRAWER_WIDTH,
        boxSizing: 'border-box',
        backgroundColor: '#f1efe9',
        border: 'none',
    },
}));

const SidebarItem = styled(ListItem)(({ theme, active }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '10%',
        height: '80%',
        width: 3,
        backgroundColor: active ? '#e7486f' : 'transparent',
        borderRadius: '0 4px 4px 0',
        transition: 'all 0.3s ease',
    },
    '&:hover': {
        '&::before': {
            backgroundColor: '#e7486f',
            opacity: active ? 1 : 0.5,
        },
    },
}));

const getPagesByRole= (role) => {
    const commonPages = [
        { name: 'About Us', icon: <InfoIcon />, path: '/about' },
    ];

    const pagesByRole = {
        admin: [
            { name: 'Dashboard', icon: <HomeIcon />, path: '/admin' },
            { name: 'Books', icon: <LibraryIcon />, path: '/admin/books' },
            { name: 'Users', icon: <UsersIcon />, path: '/admin/users' },
            { name: 'Orders', icon: <OrderIcon />, path: '/admin/orders' },
            { name: 'Rentals', icon: <RentalIcon />, path: '/admin/rentals' },            { name: 'Stats', icon: <StatsIcon />, path: '/admin/stats' },
        ],        author: [
            { name: 'Dashboard', icon: <HomeIcon />, path: '/author' },
            { name: 'Books', icon: <LibraryIcon />, path: '/author/my-books' },
            { name: 'Add Book', icon: <AddIcon />, path: '/author/add-book' },
            { name: 'My Rentals', icon: <RentalIcon />, path: '/author/my-rentals' },
            { name: 'My Orders', icon: <OrderIcon />, path: '/author/my-orders' },
        ],user: [
            { name: 'Home', icon: <HomeIcon />, path: '/user/home' },
            { name: 'My Rentals', icon: <RentalIcon />, path: '/user/my-rentals' },
            { name: 'My Orders', icon: <OrderIcon />, path: '/user/my-orders' },
        ],
    };

    return [...(pagesByRole[role] || pagesByRole.user), ...commonPages];
};

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { user, logout } = useAuth();
    const pages = getPagesByRole(user?.role);
    const [anchorEl, setAnchorEl] = useState(null);
    
    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };    const handleProfile = () => {
        const role = user?.role || 'user';
        let profilePath;
        
        // Determine the correct profile path based on user role
        switch (role) {
            case 'admin':
                profilePath = '/admin/profile';
                break;
            case 'author':
                profilePath = '/author/profile';
                break;
            default:
                profilePath = '/user/profile';
        }
        
        navigate(profilePath, { replace: true });
        handleCloseMenu();
    };

    const handleLogout = () => {
        handleCloseMenu();
        logout();
    };

    return (
        <>            <Sidebar variant="permanent">
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        py: 2,
                    }}
                >
                    <List>
                        {pages.map((page) => (
                            <SidebarItem
                                button
                                key={page.name}
                                active={location.pathname === page.path ? 1 : 0}
                                onClick={() => navigate(page.path)}
                            >
                                <ListItemIcon sx={{ minWidth: 'auto', color: location.pathname === page.path ? '#e7486f' : 'inherit' }}>
                                    {page.icon}
                                </ListItemIcon>
                            </SidebarItem>
                        ))}
                    </List>                    <List>
                        <SidebarItem
                            button
                            onClick={handleOpenMenu}
                            sx={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 'auto'
                            }}
                        >
                            <Avatar 
                                sx={{ 
                                    bgcolor: '#e7486f',
                                    width: 40,
                                    height: 40,
                                    border: '2px solid transparent',
                                    '&:hover': {
                                        border: '2px solid #e7486f',
                                    }
                                }}
                            >
                                {user?.name?.charAt(0) || 'G'}
                            </Avatar>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleCloseMenu}
                                PaperProps={{
                                    sx: {
                                        mt: 1.5,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        borderRadius: '12px',
                                        minWidth: '200px',
                                    }
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {user?.name} {user?.lastname}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user?.email}
                                    </Typography>
                                </Box>
                                <Divider />
                                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                                    <PersonIcon sx={{ mr: 2, color: '#666' }} />
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#e7486f' }}>
                                    <Box component="span" sx={{ mr: 2 }}>🚪</Box>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </SidebarItem>
                    </List>
                </Box>
            </Sidebar>
        </>
    );
};

export default Navbar;
