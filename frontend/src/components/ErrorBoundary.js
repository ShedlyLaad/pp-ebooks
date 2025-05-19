import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // You can also log the error to an error reporting service here
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        p: 3,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Oops! Something went wrong.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        We're sorry for the inconvenience. Please try refreshing the page or go back to the home page.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.href = '/'}
                    >
                        Go to Home Page
                    </Button>
                    {process.env.NODE_ENV === 'development' && (
                        <Box sx={{ mt: 4, textAlign: 'left' }}>
                            <Typography variant="h6" gutterBottom>
                                Error Details:
                            </Typography>
                            <pre style={{ 
                                backgroundColor: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '4px',
                                overflowX: 'auto'
                            }}>
                                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </Box>
                    )}
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;