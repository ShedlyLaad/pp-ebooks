import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    Chip
} from '@mui/material';
import { rentalService } from '../../services/rentalService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const ManageRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRentals();
    }, []);    const loadRentals = async () => {
        try {
            setLoading(true);
            const response = await rentalService.getAllRentals();
            console.log('Rentals response in component:', response); // For debugging
            
            // Check if we have the data in the correct structure
            if (response?.success && Array.isArray(response.data)) {
                setRentals(response.data);
            } else {
                console.error('Invalid rentals data structure:', response);
                setRentals([]);
                throw new Error('Invalid data received from server');
            }
            setError(null);
        } catch (error) {
            console.error('Error loading rentals:', error);
            setError(error.message || 'Failed to load rentals');
            toast.error('Failed to load rentals');
            setRentals([]);
        } finally {
            setLoading(false);
        }
    };const handleReturn = async (rentalId) => {
        if (!rentalId) {
            toast.error('Invalid rental ID');
            return;
        }

        try {
            setLoading(true);
            await rentalService.returnBook(rentalId);
            toast.success('Book returned successfully');
            await loadRentals(); // Refresh the list
        } catch (error) {
            console.error('Error returning book:', error);
            toast.error(error.message || 'Failed to return book');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'overdue':
                return 'error';
            case 'returned':
                return 'default';
            default:
                return 'default';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={loadRentals}
                    sx={{ mt: 2 }}
                >
                    Retry Loading
                </Button>
            </Container>
        );
    }

    if (!rentals || rentals.length === 0) {
        return (
            <Container>
                <Typography variant="h4" gutterBottom>
                    Manage Rentals
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    No rentals found.
                </Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Manage Rentals
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Book Title</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Rented Date</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rentals?.map((rental) => (
                            <TableRow key={rental?._id || Math.random()}>
                                <TableCell>{rental?.bookId?.title || 'N/A'}</TableCell>
                                <TableCell>{rental?.userId?.name || 'N/A'}</TableCell>
                                <TableCell>{formatDate(rental?.rentedAt)}</TableCell>
                                <TableCell>
                                    <Box sx={{ color: isOverdue(rental?.dueDate) ? 'error.main' : 'inherit' }}>
                                        {formatDate(rental?.dueDate)}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={rental?.status || 'unknown'}
                                        color={getStatusColor(rental?.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {rental?.status !== 'returned' && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleReturn(rental._id)}
                                        >
                                            Return Book
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ManageRentals;
