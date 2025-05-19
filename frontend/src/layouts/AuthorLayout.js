import { Outlet, Navigate } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthContext';

const LayoutContainer = styled(Box)({
    minHeight: '100vh',
    display: 'flex',
});

const MainContent = styled(Box)({
    flexGrow: 1,
    width: '100%',
});

const AuthorLayout = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== 'author') {
        return <Navigate to="/" />;
    }

    return (
        <LayoutContainer>
            <Navbar />
            <MainContent>
                <Outlet />
            </MainContent>
        </LayoutContainer>
    );
};

export default AuthorLayout;
