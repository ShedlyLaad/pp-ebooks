import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // or a loading spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }    if (roles && !roles.includes(user.role)) {
        // If user doesn't have required role, redirect to their home page
        const roleRedirects = {
            admin: '/admin',
            author: '/author',
            user: '/user/home'
        };
        
        return <Navigate to={roleRedirects[user.role] || '/user/home'} replace />;
    }

    return children;
};

export default ProtectedRoute;