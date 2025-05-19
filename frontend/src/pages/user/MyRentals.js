import { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Box,
    styled,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Book as BookIcon, Warning as WarningIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { rentalService } from '../../services/rentalService';
import LoadingSpinner from '../../components/LoadingSpinner';

const MainContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    minHeight: '100vh',
    paddingTop: '90px',
    paddingLeft: '100px',
    padding: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 500,
    borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': {
        boxShadow: 'none',
    },
}));

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [returningId, setReturningId] = useState(null);
    const [selectedRental, setSelectedRental] = useState(null);
    const [openReturnDialog, setOpenReturnDialog] = useState(false);

    const loadRentals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await rentalService.getMyRentals();
            // Check if response has a data property, otherwise use the response directly
            setRentals(Array.isArray(response) ? response : (response.data || []));
        } catch (error) {
            const errorMessage = error.message || 'Failed to load rentals';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRentals();
    }, [loadRentals]);

    const handleReturnClick = (rental) => {
        setSelectedRental(rental);
        setOpenReturnDialog(true);
    };

    const handleReturnConfirm = async () => {
        if (!selectedRental?._id) return;

        try {
            setReturningId(selectedRental._id);
            await rentalService.returnBook(selectedRental._id);
            toast.success('Book returned successfully');
            await loadRentals();
        } catch (error) {
            console.error('Return error:', error);
            const errorMessage = error.message || 'Failed to return book';
            toast.error(errorMessage);
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
        
        if (dueDate < today) {
            const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
            return { 
                label: `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`, 
                color: 'error' 
            };
        }
        
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return { 
            label: `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`, 
            color: 'success' 
        };
    };

    if (loading) {
        return (
            <MainContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <LoadingSpinner />
                </Box>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Playfair Display', fontWeight: 600 }}>
                My Rentals
            </Typography>

            {error ? (
                <Box sx={{ mb: 4 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Button 
                        variant="contained"
                        onClick={loadRentals}
                        sx={{ 
                            mt: 2,
                            backgroundColor: '#2A2A2A',
                            '&:hover': { backgroundColor: '#404040' }
                        }}
                    >
                        Try Again
                    </Button>
                </Box>
            ) : rentals.length === 0 ? (
                <Box 
                    sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        borderRadius: '16px',
                    }}
                >
                    <BookIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No books in your reading list yet
                    </Typography>
                    <Button 
                        variant="contained"
                        href="/user/search"
                        sx={{ 
                            mt: 2,
                            backgroundColor: '#2A2A2A',
                            '&:hover': { backgroundColor: '#404040' }
                        }}
                    >
                        Discover Books
                    </Button>
                </Box>
            ) : (
                <StyledPaper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Book</StyledTableCell>
                                    <StyledTableCell>Rental Date</StyledTableCell>
                                    <StyledTableCell>Due Date</StyledTableCell>
                                    <StyledTableCell>Status</StyledTableCell>
                                    <StyledTableCell align="right">Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rentals.map((rental) => {
                                    const status = getRentalStatus(rental);
                                    const isOverdue = status.color === 'error';
                                    
                                    return (
                                        <TableRow 
                                            key={rental._id}
                                            sx={isOverdue ? { 
                                                backgroundColor: 'error.light',
                                                '&:hover': { backgroundColor: 'error.light' }
                                            } : {}}
                                        >
                                            <StyledTableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box 
                                                        component="img"
                                                        src={rental.bookId?.poster || '/default-book.jpg'}
                                                        alt={rental.bookId?.title || 'Book'}
                                                        sx={{ 
                                                            width: 50, 
                                                            height: 70, 
                                                            objectFit: 'cover',
                                                            borderRadius: 1,
                                                            mr: 2
                                                        }}
                                                    />
                                                    <Box>
                                                        <Typography 
                                                            variant="subtitle2"
                                                            sx={{ 
                                                                fontFamily: 'Playfair Display',
                                                                fontWeight: 600 
                                                            }}
                                                        >
                                                            {rental.bookId?.title || 'Unknown Book'}
                                                        </Typography>
                                                        <Typography 
                                                            variant="body2" 
                                                            color="text.secondary"
                                                            sx={{ fontFamily: 'Inter' }}
                                                        >
                                                            by {rental.bookId?.author || 'Unknown Author'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {formatDate(rental.rentedAt)}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography color={isOverdue ? 'error.main' : 'inherit'}>
                                                    {formatDate(rental.dueDate)}
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Chip 
                                                    label={status.label}
                                                    color={status.color}
                                                    size="small"
                                                    icon={isOverdue ? <WarningIcon /> : undefined}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell align="right">
                                                {!rental.returned && (
                                                    <ActionButton
                                                        variant="contained"
                                                        onClick={() => handleReturnClick(rental)}
                                                        disabled={returningId === rental._id}
                                                        sx={{
                                                            backgroundColor: '#2A2A2A',
                                                            '&:hover': { backgroundColor: '#404040' }
                                                        }}
                                                    >
                                                        {returningId === rental._id ? 'Returning...' : 'Return Book'}
                                                    </ActionButton>
                                                )}
                                            </StyledTableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </StyledPaper>
            )}
            
            <Dialog open={openReturnDialog} onClose={() => setOpenReturnDialog(false)}>
                <DialogTitle>Return Book</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to return "{selectedRental?.bookId?.title || 'this book'}"?
                    </Typography>
                    {selectedRental && getRentalStatus(selectedRental).color === 'error' && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            This book is overdue. Additional fees may apply.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setOpenReturnDialog(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReturnConfirm}
                        variant="contained"
                        color="primary"
                        disabled={returningId === selectedRental?._id}
                    >
                        Confirm Return
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Box 
                sx={{ 
                    mt: 6, 
                    textAlign: 'center',
                    p: 4,
                    borderTop: '1px solid rgba(0,0,0,0.1)'
                }}
            >
                <Typography variant="body1" color="text.secondary">
                    Happy reading! Remember to return your books on time to let others enjoy them too.{' '}
                    <Box component="span" sx={{ color: '#e7486f', fontWeight: 600 }}>
                        BiblioF
                    </Box>
                </Typography>
            </Box>
        </MainContainer>
    );
};

export default MyRentals;