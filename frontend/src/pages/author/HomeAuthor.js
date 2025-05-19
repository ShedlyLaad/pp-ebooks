import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Typography,
    Container,
    Paper,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Search as SearchIcon,
} from '@mui/icons-material';
import { bookService } from '../../services/bookService';
import { rentalService } from '../../services/rentalService';
import { orderService } from '../../services/orderService';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'react-toastify';

const MainContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    minHeight: '100vh',
    paddingTop: '90px',
    paddingLeft: '100px',
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
    padding: theme.spacing(4),
}));

const HeadingText = styled(Typography)({
    fontFamily: 'Playfair Display, serif',
    color: '#2A2A2A',
    marginBottom: '1rem',
});

const FilterPaper = styled(Paper)({
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    marginBottom: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
});

const StyledCard = styled(Card)({
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease'
    }
});

const HomeAuthor = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'newest',
        category: ''
    });
    const [categories, setCategories] = useState([]);
    const [actionLoading, setActionLoading] = useState({ type: null, id: null });

    const loadBooks = useCallback(async () => {
        try {
            setLoading(true);
            const [booksData, categoriesData] = await Promise.all([
                bookService.searchBooks(filters),
                bookService.getCategories()
            ]);
            setBooks(booksData);
            setCategories(categoriesData);
            setLoading(false);
        } catch (err) {
            setError('Failed to load books. Please try again later.');
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };    const handleRent = async (book) => {
        try {
            // Prevent authors from renting their own books
            if (book.author?._id === user?._id) {
                toast.error("You cannot rent your own book");
                return;
            }

            setActionLoading({ type: 'rent', id: book._id });
            
            // Set due date to 14 days from now
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);
            
            await rentalService.rentBook({
                bookId: book._id,
                dueDate: dueDate.toISOString()
            });
            toast.success('Book rented successfully!');
            navigate('/author/my-rentals');
        } catch (error) {
            // Specific error handling for 403 errors
            if (error.response?.status === 403) {
                toast.error('You do not have permission to rent this book');
            } else {
                toast.error(error.message || 'Failed to rent book');
            }
        } finally {
            setActionLoading({ type: null, id: null });
        }
    };

    const handleBuy = async (book) => {
        try {
            // Prevent authors from buying their own books
            if (book.author?._id === user?._id) {
                toast.error("You cannot purchase your own book");
                return;
            }

            setActionLoading({ type: 'buy', id: book._id });
            await orderService.createOrder({
                orderItems: [{
                    bookId: book._id,
                    quantity: 1
                }]
            });
            toast.success('Book ordered successfully!');
            navigate('/author/my-orders');
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('You do not have permission to purchase this book');
            } else {
                toast.error(error.message || 'Failed to purchase book');
            }
        } finally {
            setActionLoading({ type: null, id: null });
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <MainContainer>
            <ContentWrapper>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <HeadingText variant="h4">
                            Welcome back, {user?.name}!
                        </HeadingText>
                    </Grid>

                    <Grid item xs={12}>
                        <FilterPaper>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"                                        placeholder="Search books..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={filters.category}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                            label="Category"
                                        >
                                            <MenuItem value="">All Categories</MenuItem>
                                            {categories.map((category) => (
                                                <MenuItem key={category._id} value={category._id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Sort By</InputLabel>
                                        <Select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            label="Sort By"
                                        >
                                            <MenuItem value="newest">Newest First</MenuItem>
                                            <MenuItem value="oldest">Oldest First</MenuItem>
                                            <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                                            <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </FilterPaper>
                    </Grid>

                    {books.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6" color="textSecondary">
                                    No books found matching your criteria.
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <Grid container spacing={3}>
                                {books.map((book) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                                        <BookCard
                                            book={book}                                            isUser={true}
                                            onRent={() => handleRent(book)}
                                            onBuy={() => handleBuy(book)}
                                            loading={
                                                (actionLoading.type === 'rent' && actionLoading.id === book._id) ||
                                                (actionLoading.type === 'buy' && actionLoading.id === book._id)
                                            }
                                            disableButtons={book.author?._id === user?._id}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </ContentWrapper>
        </MainContainer>
    );
};

export default HomeAuthor;