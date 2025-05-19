import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Toolbar,
    Typography,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    InputBase,
    Badge
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    LibraryBooks as BooksIcon,
    People as UsersIcon,
    ShoppingCart as OrdersIcon,
    BookOnline as RentalsIcon,
    Person as ProfileIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import Logo from '../images/Logo1.png'; 

const drawerWidth = 240;

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { text: 'Manage Books', icon: <BooksIcon />, path: '/admin/books' },
        { text: 'Manage Users', icon: <UsersIcon />, path: '/admin/users' },
        { text: 'Manage Orders', icon: <OrdersIcon />, path: '/admin/orders' },
        { text: 'Manage Rentals', icon: <RentalsIcon />, path: '/admin/rentals' }
    ];

    const drawer = (
        <Box sx={{
            height: '100%',
            bgcolor: '#232946',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pb: 2
        }}>
            <Box>
                <Toolbar sx={{ px: 2, minHeight: 64 }}>
                    {/* LOGO */}
                    <Box
                        component="img"
                        src={Logo}
                        alt="Logo"
                        sx={{
                            height: 100,
                            width: 'auto',
                            mr: 1,
                            display: 'block',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/admin')}
                    />
                </Toolbar>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }} />
                <List>
                    {menuItems.map((item) => {
                        const selected = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    selected={selected}
                                    onClick={() => {
                                        navigate(item.path);
                                        setMobileOpen(false);
                                    }}
                                    sx={{
                                        color: selected ? '#00b8d9' : '#fff',
                                        bgcolor: selected ? '#fff' : 'inherit',
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        fontWeight: selected ? 700 : 500,
                                        '&:hover': {
                                            bgcolor: '#fff',
                                            color: '#00b8d9',
                                        },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{ fontWeight: selected ? 'bold' : 500 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
          
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f6f8fa', minHeight: '100vh' }}>
            <CssBaseline />
            {/* AppBar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: '#fff',
                    color: '#232946',
                    borderBottom: '1px solid #e3e6f0',
                    boxShadow: '0 2px 8px rgba(60,60,60,0.04)'
                }}
            >
                <Toolbar sx={{ minHeight: 64 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    {/* Search bar */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            maxWidth: 400,
                            bgcolor: '#f3f5f7',
                            borderRadius: 2,
                            px: 2,
                            py: 0.5,
                            mr: 2
                        }}
                    >
                        <SearchIcon sx={{ color: '#b0b8c1', mr: 1 }} />
                        <InputBase
                            placeholder="Search"
                            inputProps={{ 'aria-label': 'search' }}
                            sx={{
                                flex: 1,
                                color: 'inherit',
                                fontSize: 16,
                                fontWeight: 500,
                                letterSpacing: 0.5
                            }}
                        />
                    </Box>
                    {/* AppBar right: notifications + avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton>
                            <Badge color="error" variant="dot" overlap="circular">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                                    {user?.name?.[0] || 'A'}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem onClick={() => {
                                handleCloseUserMenu();
                                navigate('/admin/profile');
                            }}>
                                <ListItemIcon>
                                    <ProfileIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography textAlign="center">Profile</Typography>
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography textAlign="center">Logout</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            bgcolor: '#232946',
                            color: '#fff'
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            bgcolor: '#232946',
                            color: '#fff'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 4 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: { xs: 8, sm: 9 },
                    bgcolor: '#f6f8fa',
                    minHeight: '100vh'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
