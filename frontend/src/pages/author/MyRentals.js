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
    TableSortLabel,
    IconButton,
    Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
    marginTop: '24px',
});

const StyledTableCell = styled(TableCell)({
    fontFamily: 'Roboto',
    '&.MuiTableCell-head': {
        backgroundColor: '#f3f5f7',
        fontWeight: 600,
    }
});

const RentalDetails = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: 'rgba(0,0,0,0.01)',
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const RentalRow = ({ rental, onReturn, isReturning }) => {
    const [open, setOpen] = useState(false);

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
            return { label: 'Overdue', color: 'error' };
        }
        return { label: 'Active', color: 'success' };
    };

    const status = getRentalStatus(rental);
    const daysLeft = rental.returned ? 0 : 
        Math.ceil((new Date(rental.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <>
            <TableRow hover>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{rental.bookId?.title || 'Book not available'}</TableCell>
                <TableCell>{formatDate(rental.rentedAt)}</TableCell>
                <TableCell>{formatDate(rental.dueDate)}</TableCell>
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
                            onClick={() => onReturn(rental)}
                            disabled={isReturning}
                        >
                            Return Book
                        </Button>
                    )}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <RentalDetails>
                            <Typography variant="h6" gutterBottom>
                                Rental Details
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" color="text.secondary">
                                    Book Information
                                </Typography>
                                <Typography variant="body2">
                                    Author: {rental.bookId?.author || 'Unknown'}
                                </Typography>
                                <Typography variant="body2">
                                    Category: {rental.bookId?.category?.name || 'Uncategorized'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body1" color="text.secondary">
                                    Rental Information
                                </Typography>
                                <Typography variant="body2">
                                    Status: {status.label}
                                </Typography>
                                {!rental.returned && (
                                    <Typography variant="body2" color={daysLeft < 0 ? 'error' : 'text.primary'}>
                                        {daysLeft < 0 
                                            ? `Overdue by ${Math.abs(daysLeft)} days` 
                                            : `${daysLeft} days remaining`}
                                    </Typography>
                                )}
                                {rental.returned && rental.returnedAt && (
                                    <Typography variant="body2">
                                        Returned on: {formatDate(rental.returnedAt)}
                                    </Typography>
                                )}
                            </Box>
                        </RentalDetails>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openReturnDialog, setOpenReturnDialog] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);
    const [returningId, setReturningId] = useState(null);
    const [orderBy, setOrderBy] = useState('rentedAt');
    const [order, setOrder] = useState('desc');

    const loadRentals = async () => {
        try {
            setLoading(true);
            const response = await rentalService.getMyRentals();
            const rentalsData = response.data || response;
            const formattedRentals = (Array.isArray(rentalsData) ? rentalsData : []).map(rental => ({
                ...rental,
                rentedAt: new Date(rental.rentedAt),
                dueDate: new Date(rental.dueDate),
                returnedAt: rental.returnedAt ? new Date(rental.returnedAt) : null
            }));
            setRentals(formattedRentals);
            setError(null);
        } catch (err) {
            setError('Failed to fetch rentals. Please try again later.');
            console.error('Error fetching rentals:', err);
            toast.error('Failed to load rentals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRentals();
    }, []);

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
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
            toast.error(error.message || 'Failed to return book');
        } finally {
            setReturningId(null);
            setOpenReturnDialog(false);
            setSelectedRental(null);
        }
    };

    const sortedRentals = [...rentals].sort((a, b) => {
        if (orderBy === 'rentedAt') {
            return order === 'asc' 
                ? a.rentedAt - b.rentedAt 
                : b.rentedAt - a.rentedAt;
        }
        if (orderBy === 'dueDate') {
            return order === 'asc' 
                ? a.dueDate - b.dueDate 
                : b.dueDate - a.dueDate;
        }
        return 0;
    });

    if (loading) {
        return (
            <MainContainer>
                <ContentWrapper>
                    <LoadingSpinner />
                </ContentWrapper>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            <ContentWrapper>
                <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Playfair Display' }}>
                    My Rentals
                </Typography>

                <StyledTableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell />
                                <StyledTableCell>Book Title</StyledTableCell>
                                <StyledTableCell>
                                    <TableSortLabel
                                        active={orderBy === 'rentedAt'}
                                        direction={orderBy === 'rentedAt' ? order : 'asc'}
                                        onClick={() => handleSort('rentedAt')}
                                    >
                                        Rental Date
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <TableSortLabel
                                        active={orderBy === 'dueDate'}
                                        direction={orderBy === 'dueDate' ? order : 'asc'}
                                        onClick={() => handleSort('dueDate')}
                                    >
                                        Due Date
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rentals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            You haven't rented any books yet
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedRentals.map((rental) => (
                                    <RentalRow 
                                        key={rental._id}
                                        rental={rental}
                                        onReturn={handleOpenReturnDialog}
                                        isReturning={returningId === rental._id}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>

                <Dialog 
                    open={openReturnDialog} 
                    onClose={() => setOpenReturnDialog(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)'
                        }
                    }}
                >
                    <DialogTitle>Return Book</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Are you sure you want to return "{selectedRental?.bookId?.title}"?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => setOpenReturnDialog(false)}
                            disabled={!!returningId}
                        >
                            Cancel
                        </Button>
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
