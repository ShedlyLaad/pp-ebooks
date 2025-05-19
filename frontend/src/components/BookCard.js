import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    Chip,
    styled,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    BookmarkBorder as RentIcon,
    Favorite as FavoriteIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoadingSpinner from './LoadingSpinner';
import { orderService } from '../services/orderService';
import { rentalService } from '../services/rentalService';
import { toast } from 'react-toastify';
import { addDays, format } from 'date-fns';

const StyledCard = styled(Card)({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    },
});

const StyledCardMedia = styled(CardMedia)({
    height: 240,
    position: 'relative',
});

const BookOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
    '&:hover': {
        opacity: 1,
    },
});

const ActionButton = styled(Button)({
    margin: '0 8px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#2A2A2A',
    '&:hover': {
        backgroundColor: '#ffffff',
    },
});

const PriceChip = styled(Chip)({
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    fontWeight: 600,
    fontSize: '1rem',
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        padding: theme.spacing(2),
    },
}));

const BookCard = ({ book, onActionComplete, isActionLoading, actionLoadingType }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [rentDate, setRentDate] = useState(addDays(new Date(), 1));
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState(null);

    const handleActionClick = (action) => {
        setSelectedAction(action);
        setError(null);
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setSelectedAction(null);
        setError(null);
        setQuantity(1);
        setRentDate(addDays(new Date(), 1));
    };

    const handleOrder = async () => {
        try {
            setError(null);
            if (quantity > book.stock) {
                setError('Quantity exceeds available stock');
                return;
            }

            const orderData = {
                orderItems: [{
                    bookId: book._id,
                    quantity: quantity
                }]
            };

            await orderService.createOrder(orderData);
            toast.success('Order placed successfully!');
            onActionComplete?.('order');
            handleClose();
        } catch (error) {
            setError(error.message || 'Failed to place order');
            console.error('Order error:', error);
        }
    };

    const handleRent = async () => {
        try {
            setError(null);
            if (!rentDate) {
                setError('Please select a return date');
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (rentDate <= today) {
                setError('Return date must be in the future');
                return;
            }

            const rentalData = {
                bookId: book._id,
                dueDate: rentDate.toISOString()
            };

            await rentalService.rentBook(rentalData);
            toast.success('Book rented successfully!');
            onActionComplete?.('rent');
            handleClose();
        } catch (error) {
            setError(error.message || 'Failed to rent book');
            console.error('Rental error:', error);
        }
    };

    const isLoading = isActionLoading && (
        (selectedAction === 'order' && actionLoadingType === 'order') ||
        (selectedAction === 'rent' && actionLoadingType === 'rent')
    );

    return (
        <StyledCard>
            <StyledCardMedia
                component="div"
                image={book.poster || '/default-book.jpg'}
                sx={{ paddingTop: '56.25%', position: 'relative' }}
            >
                <PriceChip
                    label={`$${book.price.toFixed(2)}`}
                    color="primary"
                />
                <BookOverlay>
                    <ActionButton
                        variant="contained"
                        onClick={() => handleActionClick('order')}
                        disabled={book.stock === 0}
                    >
                        Order
                    </ActionButton>
                    <ActionButton
                        variant="contained"
                        onClick={() => handleActionClick('rent')}
                        disabled={book.stock === 0}
                    >
                        Rent
                    </ActionButton>
                </BookOverlay>
            </StyledCardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                    {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                    by {book.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                </Typography>
            </CardContent>

            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>
                    {selectedAction === 'order' ? 'Order Book' : 'Rent Book'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            {book.title}
                        </Typography>
                        {selectedAction === 'order' ? (
                            <TextField
                                fullWidth
                                type="number"
                                label="Quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                inputProps={{ min: 1, max: book.stock }}
                                sx={{ mt: 2 }}
                            />
                        ) : (
                            <DatePicker
                                label="Return Date"
                                value={rentDate}
                                onChange={setRentDate}
                                minDate={addDays(new Date(), 1)}
                                maxDate={addDays(new Date(), 30)}
                                sx={{ mt: 2, width: '100%' }}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={selectedAction === 'order' ? handleOrder : handleRent}
                        variant="contained"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : selectedAction === 'order' ? 'Place Order' : 'Rent Book'}
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledCard>
    );
};

export default BookCard;