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
    Info as InfoIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { orderService } from '../services/orderService';
import { rentalService } from '../services/rentalService';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)({
    height: '500px', // Augmentation de la hauteur fixe
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(231, 72, 111, 0.1)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 15px 30px rgba(231, 72, 111, 0.1)',
    },
});

const StyledCardMedia = styled(CardMedia)({
    height: '340px', // Augmentation de la hauteur de l'image
    position: 'relative',
    transition: 'transform 0.3s ease',
    objectFit: 'cover',
    '&:hover': {
        transform: 'scale(1.05)',
    },
});

const BookOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Overlay blanc transparent
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    '&:hover': {
        opacity: 1,
    },
});

const ActionButton = styled(Button)({
    margin: '0 8px',
    minWidth: 'auto',
    padding: '8px',
    color: '#757575', // Gris neutre
    '&:hover': {
        backgroundColor: 'transparent',
        color: '#424242', // Gris plus foncé au survol
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.8rem',
    }
});

const PriceChip = styled(Chip)({
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff',
    color: '#e7486f',
    fontWeight: 700,
    fontSize: '1.1rem',
    padding: '8px 4px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    '& .MuiChip-label': {
        padding: '0 12px',
    },
});

const BookCard = ({ 
    book, 
    onEdit, 
    onDelete, 
    onActionComplete, 
    isActionLoading, 
    actionLoadingType,
    isAuthorView,
    hideActions 
}) => {
    const navigate = useNavigate();
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
            <Box sx={{ position: 'relative' }}>
                <StyledCardMedia
                    component="img"
                    src={book.poster ? `http://localhost:8000/books/${book.poster.replace(/^.*[\\\/]/, '')}` : '/placeholder-book.jpg'}
                    title={book.title}
                    alt={book.title}
                />
                <PriceChip label={`$${book.price}`} />
                {!hideActions && (
                    <BookOverlay>
                        <ActionButton
                            onClick={() => navigate(`/user/books/${book._id}`)}
                        >
                            <InfoIcon />
                        </ActionButton>
                        {!isAuthorView ? (
                            <>
                                <ActionButton
                                    onClick={() => handleActionClick('order')}
                                >
                                    <ShoppingCartIcon />
                                </ActionButton>
                                <ActionButton
                                    onClick={() => handleActionClick('rent')}
                                >
                                    <RentIcon />
                                </ActionButton>
                            </>
                        ) : (
                            <>
                                <ActionButton onClick={() => onEdit(book)}>
                                    Edit
                                </ActionButton>
                                <ActionButton onClick={() => onDelete(book)}>
                                    Delete
                                </ActionButton>
                            </>
                        )}
                    </BookOverlay>
                )}
            </Box>
            <CardContent sx={{ 
                flexGrow: 1, 
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px', // Hauteur minimale pour le contenu
                '& .MuiTypography-h6': {
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#2A2A2A',
                    mb: 1
                },
                '& .MuiTypography-body2': {
                    color: 'rgba(0,0,0,0.6)',
                    fontSize: '0.95rem'
                }
            }}>
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

            <Dialog 
                open={openDialog} 
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        p: 2,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }
                }}
            >
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
                            <>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    inputProps={{ min: 1, max: book.stock }}
                                    sx={{ mt: 2 }}
                                />
                                <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
                                    Total: ${(quantity * book.price).toFixed(2)}
                                </Typography>
                            </>
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
                        {isLoading
                            ? 'Processing...'
                            : selectedAction === 'order'
                            ? 'Place Order'
                            : 'Rent Book'}
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledCard>
    );
};

export default BookCard;
