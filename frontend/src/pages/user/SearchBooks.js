import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Grid,
    TextField,
    MenuItem,
    Typography,
    Box,
    FormControl,
    FormControlLabel,
    Checkbox,
    InputAdornment,
    Alert,
    Button,
    styled,
    Paper,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { bookService } from '../../services/bookService';
import { orderService } from '../../services/orderService';
import { rentalService } from '../../services/rentalService';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const MainContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    minHeight: '100vh',
    paddingTop: '90px', // Account for the top bar
    paddingLeft: '100px', // Account for the sidebar
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
    padding: theme.spacing(4),
}));

const HeadingText = styled(Typography)({
    fontFamily: 'Playfair Display, serif',
    color: '#2A2A2A',
    marginBottom: '2rem',
});

const FilterPaper = styled(Paper)({
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    marginBottom: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
});

const SearchBooks = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({ type: null, id: null });
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        inStock: false
    });

    const loadCategories = useCallback(async () => {
        try {
            const response = await bookService.getCategories();
            setCategories(response.data);
        } catch (error) {
            toast.error('Failed to load categories');
        }
    }, []);

    const searchBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await bookService.searchBooks({
                search: filters.search,
                category: filters.category,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                inStock: filters.inStock || undefined
            });
            setBooks(response.data || []);
        } catch (error) {
            const errorMessage = error.message || 'Failed to search books';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            searchBooks();
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [searchBooks]);

    const handleFilterChange = (e) => {
        const { name, value, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: name === 'inStock' ? checked : value
        }));
    };

    const handleOrder = async (book) => {
        try {
            setActionLoading({ type: 'order', id: book._id });
            await orderService.createOrder({
                orderItems: [{
                    bookId: book._id,
                    quantity: 1
                }]
            });
            toast.success('Book ordered successfully!');
            await searchBooks();
        } catch (error) {
            const errorMessage = error.message || 'Failed to order book';
            toast.error(errorMessage);
        } finally {
            setActionLoading({ type: null, id: null });
        }
    };

    const handleRent = async (book) => {
        try {
            setActionLoading({ type: 'rent', id: book._id });
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); // 2 weeks rental period
            
            await rentalService.rentBook({
                bookId: book._id,
                dueDate: dueDate.toISOString()
            });
            toast.success('Book rented successfully!');
            await searchBooks();
        } catch (error) {
            const errorMessage = error.message || 'Failed to rent book';
            toast.error(errorMessage);
        } finally {
            setActionLoading({ type: null, id: null });
        }
    };

    return (
        <MainContainer>
            <ContentWrapper maxWidth="xl">
                <HeadingText variant="h4" gutterBottom>
                    Explore Our Library
                </HeadingText>

                <FilterPaper>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Search Books"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <TextField
                                    select
                                    label="Category"
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        }
                                    }}
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    {categories.map((category) => (
                                        <MenuItem key={category._id} value={category._id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.inStock}
                                        onChange={handleFilterChange}
                                        name="inStock"
                                    />
                                }
                                label="In Stock Only"
                                sx={{
                                    '& .MuiFormControlLabel-label': {
                                        fontFamily: 'Inter, sans-serif'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Min Price"
                                name="minPrice"
                                type="number"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Max Price"
                                name="maxPrice"
                                type="number"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </FilterPaper>

                {error ? (
                    <Box sx={{ mb: 4 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                        <Button 
                            variant="contained" 
                            onClick={searchBooks}
                            sx={{ 
                                display: 'block', 
                                mx: 'auto',
                                backgroundColor: '#2A2A2A',
                                '&:hover': { backgroundColor: '#404040' }
                            }}
                        >
                            Retry Search
                        </Button>
                    </Box>
                ) : loading ? (
                    <LoadingSpinner />
                ) : books.length === 0 ? (
                    <Box 
                        sx={{ 
                            textAlign: 'center',
                            py: 8,
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            borderRadius: '16px',
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No books found matching your criteria.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Try adjusting your filters to find more books.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Typography 
                            variant="h5" 
                            gutterBottom 
                            sx={{ 
                                fontFamily: 'Playfair Display',
                                mb: 3 
                            }}
                        >
                            {books.length} Book{books.length !== 1 ? 's' : ''} Found
                        </Typography>
                        <Grid container spacing={3}>
                            {books.map((book) => (
                                <Grid item xs={12} sm={6} md={4} key={book._id}>
                                    <BookCard
                                        book={book}
                                        onOrder={() => handleOrder(book)}
                                        onRent={() => handleRent(book)}
                                        isActionLoading={actionLoading.id === book._id}
                                        actionLoadingType={actionLoading.type}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
                
                <Box 
                    sx={{ 
                        mt: 6, 
                        textAlign: 'center',
                        p: 4,
                        borderTop: '1px solid rgba(0,0,0,0.1)'
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        Can't find what you're looking for? Our collection is growing every day with{' '}
                        <Box component="span" sx={{ color: '#e7486f', fontWeight: 600 }}>
                            BiblioF
                        </Box>
                    </Typography>
                </Box>
            </ContentWrapper>
        </MainContainer>
    );
};

export default SearchBooks;