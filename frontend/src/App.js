import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTheme } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './auth/ProtectedRoute';
import RouteConfig from './routes';
import { AuthProvider } from './auth/AuthContext';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

function App() {
    const renderRoute = (route) => {
        const element = route.roles ? (
            <ProtectedRoute roles={route.roles}>{route.element}</ProtectedRoute>
        ) : (
            route.element
        );

        return route.children ? (
            <Route key={route.path} path={route.path} element={element}>
                {route.children.map((child) => {
                    const childElement = route.roles ? (
                        <ProtectedRoute roles={route.roles}>{child.element}</ProtectedRoute>
                    ) : (
                        child.element
                    );
                    return (
                        <Route
                            key={`${route.path}/${child.path}`}
                            path={child.path}
                            element={childElement}
                        />
                    );
                })}
            </Route>
        ) : (
            <Route key={route.path} path={route.path} element={element} />
        );
    };

    const routes = RouteConfig();
    
    return (
        <ErrorBoundary>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <AuthProvider>
                        <Routes>
                            {routes.map(renderRoute)}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                        />
                    </AuthProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
