import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    styled,
    Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import { rentalService } from '../../services/rentalService';
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

const StyledTableContainer = styled(TableContainer)({
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
});

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openReturnDialog, setOpenReturnDialog] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);
    const [returningId, setReturningId] = useState(null);

    useEffect(() => {
        loadRentals();
    }, []);

    const loadRentals = async () => {
        try {
            setLoading(true);
            const response = await rentalService.getMyRentals();
            setRentals(response.data || []);
            setError(null);
        } catch (error) {
            console.error('Error loading rentals:', error);
            setError('Failed to load rentals. Please try again.');
            toast.error('Failed to load rentals');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReturnDialog = (rental) => {
        setSelectedRental(rental);
        setOpenReturnDialog(true);
    };

    const handleReturn = async () => {
        if (!selectedRental) return;

        try {
            setReturningId(selectedRental._id);
            await rentalService.returnBook(selectedRental._id);
            toast.success('Book returned successfully');
            await loadRentals();
        } catch (error) {
            console.error('Return error:', error);
            if (error.response?.status === 403) {
                toast.error('You do not have permission to return this book');
            } else {
                const errorMessage = error.message || 'Failed to return book';
                toast.error(errorMessage);
            }
        } finally {
            setReturningId(null);
            setOpenReturnDialog(false);
            setSelectedRental(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRentalStatus = (rental) => {
        if (rental.returned) {
            return { label: 'Returned', color: 'default' };
        }
        
        const dueDate = new Date(rental.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
        
        if (dueDate < today) {
            return { label: 'Overdue', color: 'error' };
        }
        return { label: 'Active', color: 'success' };
    };

    if (loading) {
        return (
            <MainContainer>
                <ContentWrapper maxWidth="lg">
                    <LoadingSpinner />
                </ContentWrapper>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            <ContentWrapper maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Playfair Display' }}>
                    My Rentals
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
                                onClick={loadRentals}
                            >
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                ) : null}

                <StyledTableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: 'rgba(231, 72, 111, 0.05)' }}>
                                <TableCell>Book Title</TableCell>
                                <TableCell>Rental Date</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rentals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            You haven't rented any books yet
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rentals.map((rental) => {
                                    const status = getRentalStatus(rental);
                                    return (
                                        <TableRow key={rental._id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box 
                                                        component="img"
                                                        src={rental.bookId?.poster || '/default-book.jpg'}
                                                        alt={rental.bookId?.title}
                                                        sx={{ 
                                                            width: 50, 
                                                            height: 70, 
                                                            objectFit: 'cover',
                                                            borderRadius: 1,
                                                            mr: 2
                                                        }}
                                                    />
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            {rental.bookId?.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            by {rental.bookId?.author?.name || 'Unknown Author'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{formatDate(rental.rentedAt)}</TableCell>
                                            <TableCell>
                                                <Typography 
                                                    color={status.color === 'error' ? 'error.main' : 'inherit'}
                                                >
                                                    {formatDate(rental.dueDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={status.label}
                                                    color={status.color}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {!rental.returned && (
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleOpenReturnDialog(rental)}
                                                        disabled={!!returningId}
                                                    >
                                                        Return Book
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>

                <Dialog open={openReturnDialog} onClose={() => setOpenReturnDialog(false)}>
                    <DialogTitle>Return Book</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Are you sure you want to return "{selectedRental?.bookId?.title}"?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenReturnDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleReturn}
                            variant="contained"
                            color="primary"
                            disabled={!!returningId}
                        >
                            {returningId ? 'Returning...' : 'Confirm Return'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </ContentWrapper>
        </MainContainer>
    );
};

export default MyRentals;
